Dash.model.ListSegment = function (segmentListNode, representation) {
    'use strict';

    var findInitializationURL = function (baseURL, segmentListNode) {
            var initializationNode = segmentListNode.getElementsByTagName('Initialization')[0],
                initializationURLAttribute = initializationNode.getAttribute('sourceURL');

            return Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, initializationURLAttribute);
        },

        findSegmentURLs = function (baseURL, segmentListNode) {
            var segmentURLNodeList = segmentListNode.getElementsByTagName('SegmentURL'),
                segmentURLList = [],
                segmentURLAttribute;

            for (var i = 0; i < segmentURLNodeList.length; i += 1) {
                segmentURLAttribute = segmentURLNodeList[i].getAttribute('media');
                segmentURLList.push(Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, segmentURLAttribute));
            }

            return segmentURLList;
        };

    var baseURL = Dash.utils.ParserModelUtils.findBaseURLInModel(representation),
        initializationURL = findInitializationURL(baseURL, segmentListNode),
        segmentURLs = findSegmentURLs(baseURL, segmentListNode);

    return {
        name: 'ListSegment',

        getParent: function () {
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