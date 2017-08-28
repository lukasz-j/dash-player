Dash.adaptation.StatsCollector = function(playbackManager, adaptationManager, videoElement, mediaSource) {
    var stalled = false;
    var stallsCount = 0;
    var representationsHistogram = {video: {}, audio: {}};
    var stats = {};
    var startTime = Date.now();

    var now = function(event, data) {
        if (typeof(stats[event]) === 'undefined') {
            stats[event] = [];
        }
        stats[event].push([Date.now() - startTime, data]);
    };

    var dispatchUpdateEvent = function() {
        eventBus.dispatchEvent({type: Dash.event.Events.ADAPTATION_STATS_UPDATE});
    }

    videoElement.addEventListener('waiting', function(event) {
        eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, "Playback stalled, buffer underrun");
        stalled = true;
        now('stalled', 1);
        stallsCount++;
        dispatchUpdateEvent();
    });
    videoElement.addEventListener('playing', function(event) {
        if (stalled) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, "Playback resumed after stall");
            stalled = false;
            now('stalled', 0);
        }
    });

    // init stalled
    now('stalled', 0);

    // initialized, dispatch initial event
    dispatchUpdateEvent();

    eventBus.addEventListener(Dash.event.Events.SEGMENT_DOWNLOADED, function(event) {
        var timelineEvent = '';
        if (event.value.mediaType == Dash.model.MediaType.VIDEO) {
            timelineEvent = 'videoSegmentComplete';
        }
        else if (event.value.mediaType == Dash.model.MediaType.AUDIO) {
            timelineEvent = 'audioSegmentComplete';
        }
        if (timelineEvent) {
            var currentBuffer = playbackManager.getBufferedPlaybackTime(event.value.mediaType);
            now(timelineEvent, {
                'segment': event.value.currentSegment,
                'representation': event.value.currentRepresentation,
                'buffer': currentBuffer,
                'throughput': event.value.throughput
            });
        }
    });

    return {
        getTimeline: function() {
            return stats;
        },
        getStallsCount: function() {
            return stallsCount;
        }
    };
}
