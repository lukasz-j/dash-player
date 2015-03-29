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
    this.initialization = [];
    this.segmentBase = [];
    this.sampleLengths = [];
    this.headers = [];
    var _this = this;

    var setHeaders = function (request) {
        _this.headers = new Uint8Array(request.response);
        _this.initialization = _this.headers.subarray(_this.initializationStart, _this.initializationEnd+1);
        _this.segmentBase = _this.headers.subarray(_this.segmentBaseStart, _this.segmentBaseEnd+1);
        for(var i=32; i<_this.segmentBase.length; i+=12) {
            _this.sampleLengths.push( _this.segmentBase[i]*16777216 + _this.segmentBase[i+1]*65536 + _this.segmentBase[i+2]*256 + _this.segmentBase[i+3]);
        }
        console.log("samples: " + _this.sampleLengths.length);
        console.log("first 135 frames size: " + _this.sampleLengths[0]);
    };
    AsyncDownloader().download(Utils().addRangeToBaseUrl(this.baseUrl, this.initializationStart, this.segmentBaseEnd), true, setHeaders);

}
