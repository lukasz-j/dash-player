Dash.model.ListSegment = function (representation, headerURL, segmentURLs) {
    return {
        /* DEBUG ONLY, use methods instead of fields */
        _representation: representation,
        _headerURL: headerURL,
        _segmentURLs: segmentURLs,
        /*******/

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