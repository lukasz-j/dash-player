Dash.model.Representation = function (adaptationSet, id, bandwidth, width, height, frameRate, codecs, audioSamplingRate) {
    'use strict';

    var segment;

    return {
        name: 'Representation',

        setSegment: function (newSegment) {
            segment = newSegment;
        },

        getSegment: function () {
            return segment;
        },

        getAdaptationSet: function () {
            return adaptationSet;
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