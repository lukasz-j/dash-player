Dash.model.Representation = function (representationNode, adaptationSet) {
    'use strict';

    var getDigitAttribute = function (node, attributeName) {
        var attributeValue = node.getAttribute(attributeName);

        if (typeof attributeValue !== 'undefined') {
            return parseInt(attributeValue, 10);
        }
    };

    var segment,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromNode(representationNode),
        id = representationNode.getAttribute('id'),
        codecs = representationNode.getAttribute('codecs'),
        bandwidth = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'bandwidth'),
        width = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'width'),
        height = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'height'),
        frameRate = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'frameRate'),
        audioSamplingRate = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'audioSamplingRate'),
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
            if (width) {
                return width;
            } else {
                return adaptationSet.getWidth();
            }
        },

        getHeight: function () {
            if (height) {
                return height;
            } else {
                return adaptationSet.getHeight();
            }
        },

        getFrameRate: function () {
            if (frameRate) {
                return frameRate;
            } else {
                return adaptationSet.getFrameRate();
            }
        },

        getCodecs: function () {
            if (codecs) {
                return codecs;
            } else {
                return adaptationSet.getCodecs();
            }
        },

        getAudioSamplingRate: function () {
            if (audioSamplingRate) {
                return audioSamplingRate;
            } else {
                return adaptationSet.getAudioSamplingRate();
            }
        },

        //Different representations should have different ids
        equals: function (representation) {
            return id === representation.getId();
        }
    };
};