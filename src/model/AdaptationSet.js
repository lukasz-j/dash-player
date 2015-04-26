Dash.model.AdaptationSet = function (period, mimeType) {
    'use strict';

    var representationList,
        mediaFormat = Dash.model.MediaFormat.createMediaFormatFromMimeType(mimeType),
        mediaType = Dash.model.MediaType.createMediaTypeFromMimeType(mimeType);

    return {
        name: 'AdaptationSet',

        getPeriod: function () {
            return period;
        },

        setRepresentations: function (newRepresentationList) {
            representationList = newRepresentationList;
            representationList.sort(function (a, b) { //sort representations by bandwidth
                return a.getBandwidth() - b.getBandwidth;
            });
        },

        getRepresentations: function () {
            return representationList;
        },

        getIndexOfRepresentation: function (representation) {
            for (var i = 0; i < representationList.length; i += 1) {
                if (representationList[i].equals(representation)) {
                    return i;
                }
            }
        },

        getLowestRepresentation: function () {
            return representationList[0];
        },

        getHighestRepresentation: function () {
            return representationList[representationList.length - 1];
        },

        getRepresentationByWidth: function (width) {
            for (var i = 0; i < representationList.length; i += 1) {
                var representation = representationList[i];
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
