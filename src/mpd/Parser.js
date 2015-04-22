Dash.mpd.Parser = function (mpdFileContent) {
    'use strict';

    var parsedMpdFile = new DOMParser().parseFromString(mpdFileContent, "text/xml"),

        createMPDElement = function (mpdNode) {
            var profiles = mpdNode.getAttribute("profiles"),
                type = mpdNode.getAttribute("type"),
                mediaPresentationDuration = mpdNode.getAttribute("mediaPresentationDuration"),//
                minBufferTime = mpdNode.getAttribute("minBufferTime");

            return Dash.model.MPD(profiles, type, mediaPresentationDuration, minBufferTime);
        },

        createPeriodElement = function (periodNode, mpdElement) {
            return Dash.model.Period(mpdElement);
        },

        createAdaptationSetElement = function (adaptationSetNode, periodElement) {
            var mimeType = adaptationSetNode.getAttribute('mimeType');

            return Dash.model.AdaptationSet(periodElement, mimeType);
        },

        createRepresentationElement = function (representationNode, adaptationSetElement) {
            var id = parseInt(representationNode.getAttribute('id'), 10),
                codecs = representationNode.getAttribute('codecs'),
                bandwidth = parseInt(representationNode.getAttribute('bandwidth'), 10),
                width,
                height,
                frameRate,
                audioSamplingRate;

            if (adaptationSetElement.isVideo()) {
                width = parseInt(representationNode.getAttribute('width'), 10);
                height = parseInt(representationNode.getAttribute('height'), 10);
                frameRate = parseInt(representationNode.getAttribute('frameRate'), 10);
            } else if (adaptationSetElement.isAudio()) {
                audioSamplingRate = parseInt(representationNode.getAttribute('audioSamplingRate'));
            }

            return Dash.model.Representation(adaptationSetElement, id, bandwidth, width, height, frameRate, codecs, audioSamplingRate);
        },

        createSegmentElement = function (representationNode, representationElement) {
            var baseURLNode = representationNode.getElementsByTagName('BaseURL')[0],
                segmentBaseNode = representationNode.getElementsByTagName('SegmentBase')[0],
                segmentListNode = representationNode.getElementsByTagName('SegmentList')[0];

            if (baseURLNode && segmentBaseNode) { //RANGE SEGMENT
                var decodedBaseURL = Dash.utils.CommonUtils.replaceAmpersandsInURL(baseURLNode.innerHTML),
                    initializationRangeIndex = segmentBaseNode.getElementsByTagName('Initialization')[0].getAttribute('range'),
                    segmentBaseRangeIndex = segmentBaseNode.getAttribute("indexRange"),
                    contentLength = parseInt(baseURLNode.getAttribute('yt:contentLength'), 10);

                return Dash.model.RangeSegment(representationElement, decodedBaseURL, initializationRangeIndex, segmentBaseRangeIndex, contentLength);
            } else if (segmentBaseNode && segmentListNode) { //LIST SEGMENT
                var initializationNode = segmentBaseNode.getElementsByTagName('Initialization')[0],
                    segmentURLNodeList = segmentListNode.getElementsByTagName('SegmentURL'),
                    segmentURLList = [];

                for (var i = 0; i < segmentURLNodeList.length; i += 1) {
                    segmentURLList.push(decodeURIComponent(segmentURLNodeList[i].getAttribute('media')));
                }
                var initializationSegmentURL = decodeURIComponent(initializationNode.getAttribute('sourceURL'));

                return Dash.model.ListSegment(representationElement, initializationSegmentURL, segmentURLList);
            } else {
                throw Error("Unsupported segment representation");
            }
        };

    return {
        generateModel: function () {
            //MPD
            var mpdNode = parsedMpdFile.getElementsByTagName("MPD")[0],
                mpdElement = createMPDElement(mpdNode);

            // PERIOD
            var periodNode = mpdNode.getElementsByTagName("Period")[0],
                periodElement = createPeriodElement(periodNode, mpdElement);
            mpdElement.setPeriod(periodElement);

            //ADAPTATION SET
            var adaptationSetNodes = periodNode.getElementsByTagName("AdaptationSet"),
                adaptationSetElements = [];
            for (var i = 0; i < adaptationSetNodes.length; ++i) {
                var adaptationSetNode = adaptationSetNodes[i],
                    adaptationSetElement = createAdaptationSetElement(adaptationSetNode, periodElement);
                adaptationSetElements.push(adaptationSetElement);

                //REPRESENTATION
                var representationNodes = adaptationSetNode.getElementsByTagName("Representation"),
                    representationElements = [];
                for (var j = 0; j < representationNodes.length; j += 1) {
                    var representationNode = representationNodes[j],
                        representationElement = createRepresentationElement(representationNode, adaptationSetElement);

                    var segmentElement = createSegmentElement(representationNode, representationElement);

                    representationElement.setSegment(segmentElement);

                    representationElements.push(representationElement);
                }
                adaptationSetElement.setRepresentations(representationElements);
            }

            periodElement.setAdaptationSets(adaptationSetElements);

            return mpdElement;
        }
    };
};