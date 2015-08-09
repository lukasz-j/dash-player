Dash.model.TemplateSegment = function (segmentTemplateNode, representation) {
    'use strict';
    //todo implement me

    var identifiers = {
            doubleDollar: '$$',
            representation: "$RepresentationID$",
            number: '$Number$',
            time: '$Time'
        },

        substituteIdentifiersInURL = function (URL, representationId, segmentNumber, timeValue) {
            var replacedDollars = Dash.utils.CommonUtils.replaceAll(URL, identifiers.doubleDollar, ''),
                replacedRepresentationId = Dash.utils.CommonUtils.replaceAll(replacedDollars, identifiers.representation, representationId),
                replacedSegmentNumber = Dash.utils.CommonUtils.replaceAll(replacedRepresentationId, identifiers.number, segmentNumber),
                replacedTimeValue = Dash.utils.CommonUtils.replaceAll(replacedSegmentNumber, identifiers.time, timeValue);

            return replacedTimeValue;
        };


    return {
        name: 'TemplateSegment',

        getRepresentation: function () {
            return representation;
        },

        getInitializationURL: function () {
            return headerURL;
        },

        getSegmentURLs: function () {
            return segmentURLs;
        }
    };
};
