function RepresentationRepository(mpdFile) {
    var parsedMpd = new DOMParser().parseFromString(mpdFile, "text/xml");
    var mediaPresentationDuration = parsedMpd.getElementsByTagName("MPD")[0].getAttribute("mediaPresentationDuration");
    var videoLength = parseFloat(mediaPresentationDuration.substring(2, mediaPresentationDuration.length - 1));
    var adaptationSets = parsedMpd.getElementsByTagName("AdaptationSet");
    var audioRepresentations = [];
    var videoRepresentations = [];
    for (var i = 0; i < adaptationSets.length; i++) {
        if ("audio/mp4" == adaptationSets[i].getAttribute("mimeType")) {
            var representations = adaptationSets[i].getElementsByTagName("Representation");
            for (var j = 0; j < representations.length; j++) {
                var representation = new Representation(representations[j], false);
                audioRepresentations.push(representation);
            }
        } else if ("video/mp4" == adaptationSets[i].getAttribute("mimeType")) {
            var representations = adaptationSets[i].getElementsByTagName("Representation");
            for (var j = 0; j < representations.length; j++) {
                var representation = new Representation(representations[j], true);
                videoRepresentations.push(representation);
            }
        }
    }
    var getBestRepresentation = function (representations, bitRate) {
        var best = representations[0];
        for (var i = 1; i < representations.length; i++) {
            var representationBandwidth = representations[i].bandwidth;
            if (bitRate >= representationBandwidth && representationBandwidth > best.bandwidth
                || bitRate < best.bandwidth && representationBandwidth < best.bandwidth) {
                best = representations[i];
            }
        }
        return best;
    };

    return {
        getVideoLength: function () {
            return videoLength;
        },
        getAudioForBitRate: function (bitRate) {
            return getBestRepresentation(audioRepresentations, bitRate);
        },
        getVideoForBitRate: function (bitRate) {
            return getBestRepresentation(videoRepresentations, bitRate);
        }
    }
}

function Representation(representationXML, isVideo) {
    if (isVideo) {
        this.width = parseInt(representationXML.getAttribute("width"));
        this.height = parseInt(representationXML.getAttribute("height"));
    }
    this.bandwidth = parseInt(representationXML.getAttribute("bandwidth"));

    var baseUrlXML = representationXML.getElementsByTagName("BaseURL")[0];
    this.baseUrl = baseUrlXML.innerHTML.replace(/&amp;/g, '&');
    this.contetntLength = parseInt(baseUrlXML.getAttribute("yt:contentLength"));

    var initialization = representationXML.getElementsByTagName("Initialization")[0].getAttribute("range").split("-");
    this.initializationStart = parseInt(initialization[0]);
    this.initializationEnd = parseInt(initialization[1]);

    var segmentBase = representationXML.getElementsByTagName("SegmentBase")[0].getAttribute("indexRange").split("-");
    this.segmentBaseStart = parseInt(segmentBase[0]);
    this.segmentBaseEnd = parseInt(segmentBase[1]);
}
