Dash.model.Representation = function (adaptationSet, id, bandwidth, width, height, frameRate, codecs, audioSamplingRate) {

    var _segment;

    return {
        name: 'Representation',

        setSegment: function (segment) {
            _segment = segment;
        },

        getSegment: function () {
            return _segment;
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
        }
    };
};