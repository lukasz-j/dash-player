Dash.model.TemplateSegment = function (segmentTemplateNode, representation) {
    'use strict';
    //todo implement me

    var identifiers = {
            doubleDollar: '$$',
            representation: '$RepresentationID$',
            bandwidth: '$Bandwidth',
            number: '$Number$',
            time: '$Time$'
        },

        computeSegmentCount = function (videoDuration, segmentDuration, timescale) {
            var segmentDurationInSeconds = segmentDuration / timescale;
            return Math.ceil(videoDuration / segmentDurationInSeconds);
        },

        substituteCommonIdentifiersInURL = function (template, representationId, bandwidth) {
            var replacedDollars = Dash.utils.CommonUtils.replaceAll(template, identifiers.doubleDollar, ''),
                replacedRepresentationId = Dash.utils.CommonUtils.replaceAll(replacedDollars, identifiers.representation, representationId),
                replacedBandwidth = Dash.utils.CommonUtils.replaceAll(replacedRepresentationId, identifiers.bandwidth, bandwidth);

            return replacedBandwidth;
        },

        computeTimeBasedSegmentURLs = function (template, baseURL, segmentDuration, numberOfSegments) {
            var segmentURLList = [];
            for (var i = 0; i < numberOfSegments; i += 1) {
                var replacementTimeValue = i * segmentDuration;

                var replacedCommonIdentifiers = substituteCommonIdentifiersInURL(template, representation.getId(), representation.getBandwidth()),
                    substitutedURL = Dash.utils.CommonUtils.replaceAll(replacedCommonIdentifiers, identifiers.time, replacementTimeValue);

                segmentURLList.push(Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, substitutedURL));
            }

            return segmentURLList;
        },

        computeNumberBasedSegmentURLs = function (template, baseURL, startSegment, numberOfSegments) {
            var segmentURLList = [];
            for (var i = 0; i < numberOfSegments; i += 1) {
                //fixme
                var replacementNumberValue = i + startSegment;

                var replacedCommonIdentifiers = substituteCommonIdentifiersInURL(template, representation.getId(), representation.getBandwidth()),
                    substitutedURL = Dash.utils.CommonUtils.replaceAll(replacedCommonIdentifiers, identifiers.number, replacementNumberValue);

                segmentURLList.push(Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, substitutedURL));
            }

            return segmentURLList;
        },

        findDurationForRepresentation = function (representation) {
            return representation.getParent().getParent().getParent().getMediaPresentationDuration();
        };

    var baseURL = Dash.utils.ParserModelUtils.findBaseURLInModel(representation),
        templateURL = segmentTemplateNode.getAttribute('media'),
        timescale = parseInt(segmentTemplateNode.getAttribute('timescale'), 10),
        initializationURLAttribute = segmentTemplateNode.getAttribute('initialization'),
        initializationURL = Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, initializationURLAttribute),
        duration = findDurationForRepresentation(representation),
        segmentURLs = [];


    if (templateURL.indexOf(identifiers.time) > -1) {
        var sNode = segmentTemplateNode.getElementsByTagName('S')[0],
            segmentDuration = parseInt(sNode.getAttribute('d'), 10),
            numberOfSegments = computeSegmentCount(duration, segmentDuration, timescale);

        segmentURLs = computeTimeBasedSegmentURLs(templateURL, baseURL, segmentDuration, numberOfSegments);
    } else if (templateURL.indexOf(identifiers.number) > -1) {

    } else {
        throw new Error();
    }


    return {
        name: 'TemplateSegment',

        getRepresentation: function () {
            return representation;
        },

        getInitializationURL: function () {
            return initializationURL;
        },

        getSegmentURLs: function () {
            return segmentURLs;
        }
    };
};
