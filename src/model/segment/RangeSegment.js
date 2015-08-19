Dash.model.RangeSegment = function (segmentBaseNode, representation, useBytesRangeInURL) {
    'use strict';

    var initializationIndexRange = segmentBaseNode.getElementsByTagName('Initialization')[0].getAttribute('range'),
        segmentBaseIndexRange = segmentBaseNode.getAttribute("indexRange"),

        baseURL = representation.getBaseURL(),

        splitInitializationIndexRange = initializationIndexRange.split('-'),
        splitSegmentBaseIndexRange = segmentBaseIndexRange.split('-'),

        initializationStartIndex = parseInt(splitInitializationIndexRange[0], 10),
        initializationEndIndex = parseInt(splitInitializationIndexRange[1], 10),

        segmentBaseStartIndex = parseInt(splitSegmentBaseIndexRange[0], 10),
        segmentBaseEndIndex = parseInt(splitSegmentBaseIndexRange[1], 10);

    var toRangeString = function (rangeObject) {
            return rangeObject.begin + '-' + rangeObject.end;
        },

        getInitializationSegmentRange = function () {
            return {begin: initializationStartIndex, end: segmentBaseEndIndex};
        },

        getSegmentsRange = function (initialization) {
            var sampleLengths = [],
                segmentBase = initialization.subarray(segmentBaseStartIndex, segmentBaseEndIndex + 1),

                segmentRanges = [],
                startIndex = segmentBaseEndIndex + 1,
                i;

            for (i = 32; i < segmentBase.length; i += 12) {
                sampleLengths.push(segmentBase[i] * 16777216 + segmentBase[i + 1]
                    * 65536 + segmentBase[i + 2] * 256 + segmentBase[i + 3] - 1);
            }

            for (i = 0; i < sampleLengths.length; i += 1) {
                segmentRanges.push({begin: startIndex, end: startIndex + sampleLengths[i]});
                startIndex += sampleLengths[i] + 1;
            }

            return segmentRanges;
        };


    if (!Dash.utils.ParserModelUtils.isURLAbsolute(baseURL)) {
        var url = Dash.utils.ParserModelUtils.findBaseURLInModel(representation.getParent().getParent());
        baseURL = Dash.utils.ParserModelUtils.resolveAttributeURL(url, baseURL);
    }

    return {
        name: 'RangeSegment',

        getRepresentation: function () {
            return representation;
        },

        getInitializationURL: function () {
            var initializationRange = getInitializationSegmentRange();

            if (useBytesRangeInURL) {
                return Dash.utils.ParserModelUtils.createURLWithRange(baseURL, initializationRange.begin, initializationRange.end);
            } else {
                return {url: baseURL, range: toRangeString(initializationRange)};
            }
        },

        getSegmentURLs: function (initialization) {
            var segmentsRange = getSegmentsRange(initialization),
                segmentURLsWithRanges = [],
                index;

            if (useBytesRangeInURL) {
                for (index = 0; index < segmentsRange.length; index += 1) {
                    segmentURLsWithRanges.push(Dash.utils.ParserModelUtils.createURLWithRange(baseURL, segmentsRange[index].begin, segmentsRange[index].end));
                }
            } else {
                for (index = 0; index < segmentsRange.length; index += 1) {
                    segmentURLsWithRanges.push({url: baseURL, range: toRangeString(segmentsRange[index])});
                }
            }

            return segmentURLsWithRanges;
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
        }
    };
};