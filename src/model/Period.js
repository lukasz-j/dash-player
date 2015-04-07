Dash.model.Period = function (mpd) {

    var _adaptationSets = undefined,

        isAdaptationSetAudioCondition = function (adaptationSet) {
            return adaptationSet.isAudio();
        },

        isAdaptationSetVideoCondition = function (adaptationSet) {
            return adaptationSet.isVideo();
        },

        filterAdaptationSets = function (conditionFunction) {
            var sets = [];
            for (var i = 0; i < _adaptationSets.length; ++i) {
                if (conditionFunction(_adaptationSets[i])) {
                    sets.push(_adaptationSets[i])
                }
            }
            return sets;
        };

    return {
        name: 'Period',

        getMPD: function () {
            return mpd;
        },

        setAdaptationSets: function (adaptationSets) {
            _adaptationSets = adaptationSets;
        },

        getAdaptationSets: function () {
            return _adaptationSets;
        },

        getAudioAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetAudioCondition);
        },

        getVideoAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetVideoCondition);
        },

        getAudioAdaptationSet: function (format) {
            for (var i = 0; i < _adaptationSets.length; ++i) {
                if (_adaptationSets[i].isAudio() && _adaptationSets[i].getFormat() === format) {
                    return _adaptationSets[i];
                }
            }
        },

        getVideoAdaptationSet: function (format) {
            for (var i = 0; i < _adaptationSets.length; ++i) {
                if (_adaptationSets[i].isVideo() && _adaptationSets[i].getFormat() === format) {
                    return _adaptationSets[i];
                }
            }
        }
    };
};