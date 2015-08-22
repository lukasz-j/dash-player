Dash.mpd.Parser = function () {
    'use strict';

    var createMPDElement = function (mpdNode, mpdFileURL) {
            return Dash.model.MPD(mpdNode, mpdFileURL);
        },

        createPeriodElement = function (periodNode, mpdElement) {
            return Dash.model.Period(periodNode, mpdElement);
        },

        createAdaptationSetElement = function (adaptationSetNode, periodElement) {
            return Dash.model.AdaptationSet(adaptationSetNode, periodElement);
        },

        createRepresentationElement = function (representationNode, adaptationSetElement) {
            return Dash.model.Representation(representationNode, adaptationSetElement);
        },

        createSegmentElement = function (representationNode, representationElement, isYouTube) {
            var baseURL = representationElement.getBaseURL(),
                segmentTemplateNode = representationNode.getElementsByTagName('SegmentTemplate')[0],
                segmentBaseNode = representationNode.getElementsByTagName('SegmentBase')[0],
                segmentListNode = representationNode.getElementsByTagName('SegmentList')[0];

            if (baseURL && segmentBaseNode && !segmentTemplateNode && !segmentListNode) {
                //RANGE SEGMENT
                return Dash.model.RangeSegment(segmentBaseNode, representationElement, isYouTube);
            } else if (segmentListNode) {
                //LIST SEGMENT
                return Dash.model.ListSegment(segmentListNode, representationElement);
            } else if (segmentTemplateNode) {
                //TEMPLATE SEGMENT
                return Dash.model.TemplateSegment(segmentTemplateNode, representationElement);
            } else if (baseURL) {
                //fixme to skip throwing exception for text/vtt
                return;
            } else {
                throw new Error("Unsupported segment representation");
            }
        };

    return {
        generateModel: function (mpdFileContent, mpdFileURL, isYouTube) {
            var parsedMpdFile = new DOMParser().parseFromString(mpdFileContent, "text/xml");

            //MPD
            var mpdNode = parsedMpdFile.getElementsByTagName("MPD")[0],
                mpdElement = createMPDElement(mpdNode, mpdFileURL);

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

                    var segmentElement = createSegmentElement(representationNode, representationElement, isYouTube);

                    representationElement.setSegment(segmentElement);

                    representationElements.push(representationElement);
                }

                //sort representations and add them order indexes
                representationElements.sort(function (a, b) {
                    return a.getBandwidth() - b.getBandwidth();
                });

                representationElements.forEach(function (element, index) {
                    element.orderNumber = index + 1;
                });

                adaptationSetElement.setRepresentations(representationElements);
            }

            periodElement.setAdaptationSets(adaptationSetElements);

            return mpdElement;
        }
    };
};