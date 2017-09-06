Dash.adaptation.AdaptationEngine = function(adaptationManager, profile) {
    var getNextVideoRepresentation = function(event, available) {
        var targetPI = 0.25;
        var n = event.value.throughput;
        var lambda = n / (1 - targetPI);
        var target = 0;

        for (var av in available[Dash.model.MediaType.VIDEO.name]) {
            if (available[Dash.model.MediaType.VIDEO.name][av].bw >= lambda) {
                return target;
            }
            else {
                target = av;
            }
        }
        return target;
    };

    var onSegmentDownload = function(event) {
        if (event.value.mediaType == Dash.model.MediaType.VIDEO) {
            // do not prefetch representations as they may change
            // during lifespan of this engine
            var available = adaptationManager.getRepresentations();
            var videoRepr = getNextVideoRepresentation(event, available);
            if (videoRepr >= 0) {
                adaptationManager.getPlaybackManager().changeRepresentation
                        (Dash.model.MediaType.VIDEO, available[Dash.model.MediaType.VIDEO.name][videoRepr].id);
                if (available[Dash.model.MediaType.AUDIO.name]) {
                    // select sound representation in proportional way
                    var soundRepr = Math.round((videoRepr / (available[Dash.model.MediaType.VIDEO.name].length - 1)) *
                            (available[Dash.model.MediaType.AUDIO.name].length - 1));
                    adaptationManager.getPlaybackManager().changeRepresentation
                        (Dash.model.MediaType.AUDIO, available[Dash.model.MediaType.AUDIO.name][soundRepr].id);
                }
            }
        }
    };

    eventBus.addEventListener(Dash.event.Events.SEGMENT_DOWNLOADED, onSegmentDownload);

    return {
        detach: function() {
            eventBus.removeEventListener(Dash.event.Events.SEGMENT_DOWNLOADED, onSegmentDownload);
        }
    };
};
