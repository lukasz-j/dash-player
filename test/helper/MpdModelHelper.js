var MpdModelHelper = {
    createRepresentationStub: function () {
        return {
            name: 'Representation',
            orderNumber: 0,
            setSegment: function ($segment) {
            },

            getSegment: function () {
            },

            getParent: function () {
            },

            getBaseURL: function () {
            },

            getAdaptationSet: function () {
            },

            getMimeType: function () {
            },

            getId: function () {
            },

            getBandwidth: function () {
            },

            getWidth: function () {
            },

            getHeight: function () {
            },

            getFrameRate: function () {
            },

            getCodecs: function () {
            },

            getAudioSamplingRate: function () {
            },

            toShortForm: function () {
            },

            equals: function (representation) {
            }
        };
    },

    createAdaptationSetStub: function () {
        return {
            name: 'AdaptationSet',

            setRepresentations: function (newRepresentation) {
            },

            getRepresentations: function () {
            },

            getParent: function () {
            },

            getBaseURL: function () {
            },

            getIndexOfRepresentation: function (representation) {
            },

            getLowestRepresentation: function () {
            },

            getHighestRepresentation: function () {
            },

            getRepresentationByWidth: function (width) {
            },

            getRepresentationShortForms: function () {
            },

            getMimeType: function () {
            },

            getFormat: function () {
            },

            getCodecs: function () {
            },

            getWidth: function () {
            },

            getHeight: function () {
            },

            getFrameRate: function () {
            },

            getAudioSamplingRate: function () {
            },

            getMediaType: function () {
            },

            isVideo: function () {
            },

            isAudio: function () {
            },

            isText: function () {
            }
        };
    }
};

