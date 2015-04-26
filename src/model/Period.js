Dash.model.Period = function (mpd) {
    'use strict';

    var adaptationSets,

        isAdaptationSetAudioCondition = function (adaptationSet) {
            return adaptationSet.isAudio();
        },

        isAdaptationSetVideoCondition = function (adaptationSet) {
            return adaptationSet.isVideo();
        },

        filterAdaptationSets = function (conditionFunction) {
            var sets = [];
            for (var i = 0; i < adaptationSets.length; i += 1) {
                if (conditionFunction(adaptationSets[i])) {
                    sets.push(adaptationSets[i]);
                }
            }
            return sets;
        };

    return {
        name: 'Period',

        getMPD: function () {
            return mpd;
        },

        setAdaptationSets: function (newAdaptationSets) {
            adaptationSets = newAdaptationSets;
        },

        getAdaptationSets: function () {
            return adaptationSets;
        },

        getAdaptationSet: function (mediaType, format) {
            if (mediaType === Dash.model.MediaType.VIDEO) {
                return this.getVideoAdaptationSet(format);
            } else if (mediaType === Dash.model.MediaType.AUDIO) {
                return this.getAudioAdaptationSet(format);
            } else {
                throw new Error('Unsupported adaptation set format - ' + mediaType);
            }
        },

        getAudioAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetAudioCondition);
        },

        getVideoAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetVideoCondition);
        },

        getAudioAdaptationSet: function (format) {
            for (var i = 0; i < adaptationSets.length; i += 1) {
                if (adaptationSets[i].isAudio() && adaptationSets[i].getFormat() === format) {
                    return adaptationSets[i];
                }
            }
        },

        getVideoAdaptationSet: function (format) {
            for (var i = 0; i < adaptationSets.length; i += 1) {
                if (adaptationSets[i].isVideo() && adaptationSets[i].getFormat() === format) {
                    return adaptationSets[i];
                }
            }
        }
    };
};