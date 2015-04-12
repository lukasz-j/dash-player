Dash.model.Representation = function (adaptationSet, id, bandwidth, width, height, frameRate, codecs, audioSamplingRate) {

    var segment = undefined;

    return {
        /* DEBUG ONLY, use methods instead of fields */
        _segment: undefined,
        _adaptationSet: adaptationSet,
        _id: id,
        _bandwidth: bandwidth,
        _width: width,
        _height: height,
        _frameRate: frameRate,
        _codecs: codecs,
        _audioSamplingRate: audioSamplingRate,
        /*******/

        name: 'Representation',

        setSegment: function (newSegment) {
            segment = newSegment;
            this._segment = newSegment;
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