Dash.mpd.Parser = function (eventBus) {
    'use strict';

    var createMPDElement = function (mpdNode, mpdFileURL) {
            var mpd = Dash.model.MPD(mpdNode, mpdFileURL),
                logMessage = 'Mpd element created from xml node, type: ' + mpd.getType().name
                    + ', profiles: ' + mpd.getProfilesAsString() + ', duration: ' + mpd.getMediaPresentationDurationFormatted();
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
            return mpd;
        },

        createPeriodElement = function (periodNode, mpdElement) {
            var period = Dash.model.Period(periodNode, mpdElement);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Period element created from xml node');
            return period;
        },

        createAdaptationSetElement = function (adaptationSetNode, periodElement) {
            var adaptationSet = Dash.model.AdaptationSet(adaptationSetNode, periodElement);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Adaptation set element created from xml node');
            return adaptationSet;
        },

        createRepresentationElement = function (representationNode, adaptationSetElement) {
            var representation = Dash.model.Representation(representationNode, adaptationSetElement),
                logMessage = 'Representation element created from xml node, id: ' +
                    representation.getId() + ', bandwidth: ' + representation.getBandwidth();
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
            return representation;
        },

        createSegmentElement = function (representationNode, representationElement, isYouTube) {
            var baseURL = representationElement.getBaseURL(),
                segmentTemplateNode = representationNode.getElementsByTagName('SegmentTemplate')[0],
                segmentBaseNode = representationNode.getElementsByTagName('SegmentBase')[0],
                segmentListNode = representationNode.getElementsByTagName('SegmentList')[0],
                segment,
                logMessage;

            if (baseURL && segmentBaseNode && !segmentTemplateNode && !segmentListNode) {
                //RANGE SEGMENT
                segment = Dash.model.RangeSegment(segmentBaseNode, representationElement, isYouTube);
                logMessage = 'Range segment element created from xml node, baseURL: ' + representationElement.getBaseURL();
            } else if (segmentListNode) {
                //LIST SEGMENT
                segment = Dash.model.ListSegment(segmentListNode, representationElement);
                logMessage = 'List segment element created from xml node, initialization url: ' + segment.getInitializationURL();
            } else if (segmentTemplateNode) {
                //TEMPLATE SEGMENT
                segment = Dash.model.TemplateSegment(segmentTemplateNode, representationElement);
                logMessage = 'Template segment element created from xml node, template url: ' + segment.getTemplateURL();
            } else if (baseURL) {
                //fixme to skip throwing exception for text/vtt
                return;
            } else {
                throw new Error("Unsupported segment representation");
            }

            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
            return segment;
        };

    return {
        generateModel: function (mpdFileContent, mpdFileURL, isYouTube) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Parsing downloaded mpd file using DOMParser');

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
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, 'MPD file parsing finished and MPD model successfully created');
            return mpdElement;
        }
    };
};