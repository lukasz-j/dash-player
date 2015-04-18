Dash.model.RangeSegment = function (representation, baseUrl, initializationIndexRange, segmentBaseIndexRange, contentLength) {

    var splitInitializationIndexRange = initializationIndexRange.split('-'),
        splitSegmentBaseIndexRange = segmentBaseIndexRange.split('-');

    var initializationStartIndex = parseInt(splitInitializationIndexRange[0]),
        initializationEndIndex = parseInt(splitInitializationIndexRange[1]);

    var segmentBaseStartIndex = parseInt(splitSegmentBaseIndexRange[0]),
        segmentBaseEndIndex = parseInt(splitSegmentBaseIndexRange[1]);

    return {
        /* DEBUG ONLY, use methods instead of fields */
        _representation: representation,
        _baseUrl: baseUrl,
        _initializationIndexRange: initializationIndexRange,
        _segmentBaseIndexRange: segmentBaseIndexRange,
        _contentLength: contentLength,
        /*******/

        name: 'RangeSegment',

        getRepresentation: function () {
            return representation;
        },

        getHeaderURL: function () {
            return Dash.utils.CommonUtils.createURLWithRange(baseUrl, initializationStartIndex, segmentBaseEndIndex);
        },

        getSegmentURLs: function (header) {
            var sampleLengths = [],
                segmentBase = header.subarray(segmentBaseStartIndex, segmentBaseEndIndex + 1);
            for (var i = 32; i < segmentBase.length; i += 12) {
                sampleLengths.push(segmentBase[i] * 16777216 + segmentBase[i + 1] * 65536 + segmentBase[i + 2] * 256 + segmentBase[i + 3]);
            }

            var segmentURLs = [],
                startIndex = segmentBaseEndIndex + 1;
            for (var i = 0; i < sampleLengths.length; i++) {
                segmentURLs.push(Dash.utils.CommonUtils.createURLWithRange(baseUrl, startIndex, startIndex + sampleLengths[i]));
                startIndex += sampleLengths[i] + 1;
            }

            return segmentURLs;
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