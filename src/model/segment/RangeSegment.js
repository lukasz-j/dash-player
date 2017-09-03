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
        segmentBaseEndIndex = parseInt(splitSegmentBaseIndexRange[1], 10),

        segmentRangeList,

        toRangeString = function (rangeObject) {
            return rangeObject.begin + '-' + rangeObject.end;
        },

        getInitializationSegmentRange = function () {
            return {begin: initializationStartIndex, end: segmentBaseEndIndex};
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

        computeSegmentRanges: function (initializationHeader) {
            segmentRangeList = Dash.utils.ParserModelUtils.findSegmentRangedInBaseSegment(initializationHeader, segmentBaseStartIndex, segmentBaseEndIndex);
        },

        getInitializationURL: function () {
            var initializationRange = getInitializationSegmentRange();

            if (useBytesRangeInURL) {
                return Dash.utils.ParserModelUtils.createURLWithRange(baseURL, initializationRange.begin, initializationRange.end);
            } else {
                return {url: baseURL, range: toRangeString(initializationRange)};
            }
        },

        getSegmentDurations: function() {
            return segmentRangeList.map(function(segment) {
                return segment.duration;
            });
        },

        getSegmentURLs: function () {
            var segmentURLsWithRanges = [],
                index;

            if (!segmentRangeList) {
                return [];
            }

            if (useBytesRangeInURL) {
                for (index = 0; index < segmentRangeList.length; index += 1) {
                    segmentURLsWithRanges.push(Dash.utils.ParserModelUtils.createURLWithRange(baseURL, segmentRangeList[index].begin, segmentRangeList[index].end));
                }
            } else {
                for (index = 0; index < segmentRangeList.length; index += 1) {
                    segmentURLsWithRanges.push({url: baseURL, range: toRangeString(segmentRangeList[index])});
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
