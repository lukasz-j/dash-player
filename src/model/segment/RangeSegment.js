Dash.model.RangeSegment = function (representation, baseUrl, initializationIndexRange, segmentBaseIndexRange, contentLength) {

    var splitInitializationIndexRange = initializationIndexRange.split('-'),
        splitSegmentBaseIndexRange = segmentBaseIndexRange.split('-');

    var initializationStartIndex = parseInt(splitInitializationIndexRange[0]),
        initializationEndIndex = parseInt(splitInitializationIndexRange[1]);

    var segmentBaseStartIndex = parseInt(splitSegmentBaseIndexRange[0]),
        segmentBaseEndIndex = parseInt(splitSegmentBaseIndexRange[1]);

    return {
        name: 'RangeSegment',

        getRepresentation: function () {
            return representation;
        },

        getBaseURL: function () {
            return baseUrl;
        },

        getHeaderStartIndex: function () {
            return initializationStartIndex;
        },

        getHeaderEndIndex: function () {
            return segmentBaseEndIndex;
        },

        getInitializationStartIndex: function () {
            return initializationStartIndex;
        },

        getInitializationEndIndex: function () {
            return initializationEndIndex;
        },

        getSegmentBaseStartIndex: function () {
            return segmentBaseStartIndex;
        },

        getSegmentBaseEndIndex: function () {
            return segmentBaseEndIndex;
        },

        //Only YouTube
        getContentLength: function () {
            return contentLength;
        }
    };
};