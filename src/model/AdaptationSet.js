Dash.model.AdaptationSet = function (adaptationSetNode, period) {
    'use strict';

    var representations,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromParentNode(adaptationSetNode),
        mimeType,
        mediaFormat,
        mediaType;

    var sortRepresentationByBandwidth = function (representations) {
            representations.sort(function (a, b) {
                return a.getBandwidth() - b.getBandwidth;
            });
        },

        initializeMediaInformationBaseOnRepresentations = function (representations) {
            //temporary fix
            //YouTube stores mimeType element in adaptationSetNode, but ISO allows mimeType only in representationNode
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
            sortRepresentationByBandwidth(representations);
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

