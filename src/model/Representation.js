Dash.model.Representation = function (representationNode, adaptationSet) {
    'use strict';

    var getDigitAttribute = function (node, attributeName) {
        var attributeValue = node.getAttribute(attributeName);

        if (typeof attributeValue !== 'undefined') {
            return parseInt(attributeValue, 10);
        }
    };

    var segment,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromParentNode(representationNode),
        id = representationNode.getAttribute('id'),
        codecs = representationNode.getAttribute('codecs'),
        bandwidth = getDigitAttribute(representationNode, 'bandwidth'),
        width = getDigitAttribute(representationNode, 'width'),
        height = getDigitAttribute(representationNode, 'height'),
        frameRate = getDigitAttribute(representationNode, 'frameRate'),
        audioSamplingRate = getDigitAttribute(representationNode, 'audioSamplingRate'),
        mimeType = representationNode.getAttribute('mimeType');

    return {
        name: 'Representation',

        setSegment: function ($segment) {
            segment = $segment;
        },

        getSegment: function () {
            return segment;
        },

        getParent: function () {
            return adaptationSet;
        },

        getBaseURL: function () {
            return baseURL;
        },

        getAdaptationSet: function () {
            return adaptationSet;
        },

        getMimeType: function () {
            return mimeType;
        },

        getId: function () {
            return id;
        },

        getBandwidth: function () {
            return bandwidth;
        },

        getWidth: function () {
            return width;
        },

        getHeight: function () {
            return height;
        },

        getFrameRate: function () {
            return frameRate;
        },

        getCodecs: function () {
            return codecs;
        },

        getAudioSamplingRate: function () {
            return audioSamplingRate;
        },

        //Different representations should have different ids
        equals: function (representation) {
            return id === representation.getId();
        }
    };
};