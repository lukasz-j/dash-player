Dash.model.AdaptationSet = function (adaptationSetNode, period) {
    'use strict';

    var representations,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromNode(adaptationSetNode),
        codecs = adaptationSetNode.getAttribute('codecs'),
        width = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'width'),
        height = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'height'),
        frameRate = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'frameRate'),
        audioSamplingRate = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'audioSamplingRate'),
        mimeType,
        mediaFormat,
        mediaType,

        initializeMediaInformationBaseOnRepresentations = function (representations) {
            //temporary fix
            if (adaptationSetNode.hasAttribute('mimeType')) {
                mimeType = adaptationSetNode.getAttribute('mimeType');
            } else {
                mimeType = representations[0].getMimeType();
            }

            mediaFormat = Dash.model.MediaFormat.createMediaFormatFromMimeType(mimeType);
            mediaType = Dash.model.MediaType.createMediaTypeFromMimeType(mimeType);
        };

    return {
        name: 'AdaptationSet',

        setRepresentations: function (newRepresentation) {
            representations = newRepresentation;
            initializeMediaInformationBaseOnRepresentations(representations);
        },

        getRepresentations: function () {
            return representations;
        },

        getParent: function () {
            return period;
        },

        getBaseURL: function () {
            return baseURL;
        },

        getIndexOfRepresentation: function (representation) {
            for (var i = 0; i < representations.length; i += 1) {
                if (representations[i].equals(representation)) {
                    return i;
                }
            }
        },

        getLowestRepresentation: function () {
            return representations[0];
        },

        getHighestRepresentation: function () {
            return representations[representations.length - 1];
        },

        getRepresentationByWidth: function (width) {
            for (var i = 0; i < representations.length; i += 1) {
                var representation = representations[i];
                if (representation.getWidth() === width) {
                    return representation;
                }
            }
        },

        getMimeType: function () {
            return mimeType;
        },

        getFormat: function () {
            return mediaFormat;
        },

        getCodecs: function () {
            return codecs;
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

        getAudioSamplingRate: function () {
            return audioSamplingRate;
        },

        getMediaType: function () {
            return mediaType;
        },

        isVideo: function () {
            return mediaType === Dash.model.MediaType.VIDEO;
        },

        isAudio: function () {
            return mediaType === Dash.model.MediaType.AUDIO;
        },

        isText: function () {
            return mediaType === Dash.model.MediaType.TEXT;
        }
    };
};

