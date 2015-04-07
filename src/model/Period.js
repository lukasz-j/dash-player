Dash.model.Period = function (mpd) {

    var adaptationSets = undefined,

        isAdaptationSetAudioCondition = function (adaptationSet) {
            return adaptationSet.isAudio();
        },

        isAdaptationSetVideoCondition = function (adaptationSet) {
            return adaptationSet.isVideo();
        },

        filterAdaptationSets = function (conditionFunction) {
            var sets = [];
            for (var i = 0; i < adaptationSets.length; ++i) {
                if (conditionFunction(adaptationSets[i])) {
                    sets.push(adaptationSets[i])
                }
            }
            return sets;
        };

    return {
        /* DEBUG ONLY, use methods instead of fields */
        _adaptationSets: undefined,
        _mpd: mpd,
        /*******/

        name: 'Period',

        getMPD: function () {
            return mpd;
        },

        setAdaptationSets: function (newAdaptationSets) {
            adaptationSets = newAdaptationSets;
            this._adaptationSets = newAdaptationSets;
        },

        getAdaptationSets: function () {
            return adaptationSets;
        },

        getAudioAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetAudioCondition);
        },

        getVideoAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetVideoCondition);
        },

        getAudioAdaptationSet: function (format) {
            for (var i = 0; i < adaptationSets.length; ++i) {
                if (adaptationSets[i].isAudio() && adaptationSets[i].getFormat() === format) {
                    return adaptationSets[i];
                }
            }
        },

        getVideoAdaptationSet: function (format) {
            for (var i = 0; i < adaptationSets.length; ++i) {
                if (adaptationSets[i].isVideo() && adaptationSets[i].getFormat() === format) {
                    return adaptationSets[i];
                }
            }
        }
    };
};