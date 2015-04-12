Dash.model.AdaptationSet = function (period, mimeType) {
    var representationList = undefined;

    return {
        /* DEBUG ONLY, use methods instead of fields */
        _representationList: undefined,
        _period: period,
        _mimeType: mimeType,
        /*******/

        name: 'AdaptationSet',

        getPeriod: function () {
            return period;
        },

        setRepresentations: function (newRepresentationList) {
            representationList = newRepresentationList;
            representationList.sort(function (a, b) {
                return a.getBandwidth() - b.getBandwidth;
            });

            this._representationList = newRepresentationList;
        },

        getRepresentations: function () {
            return representationList;
        },

        getIndexOfRepresentation: function (representation) {
            for (var i = 0; i < representationList.length; ++i) {
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

        getMimeType: function () {
            return mimeType;
        },

        getFormat: function () {
            return mimeType.split('/')[1];
        },

        isAudio: function () {
            return mimeType.indexOf("audio") === 0;
        },

        isVideo: function () {
            return mimeType.indexOf("video") === 0;
        }
    };
};
