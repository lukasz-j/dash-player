Dash.model.ListSegment = function (representation, headerURL, segmentURLs) {
    'use strict';

    return {
        name: 'ListSegment',

        getRepresentation: function () {
            return representation;
        },

        getHeaderURL: function () {
            return headerURL;
        },

        getSegmentURLs: function () {
            return segmentURLs;
        }
    };
};