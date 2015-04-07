Dash.model.AdaptationSet = function (period, mimeType) {
    var _representationList = undefined;

    return {
        name: 'AdaptationSet',

        getPeriod: function () {
            return period;
        },

        setRepresentations: function (representationList) {
            _representationList = representationList;
            _representationList.sort(function (a, b) {
                return a.getBandwidth() - b.getBandwidth;
            });
        },

        getRepresentations: function () {
            return _representationList;
        },

        getMimeType: function () {
            return mimeType;
        },

        isAudio: function () {
            return mimeType.indexOf("audio") === 0;
        },

        isVideo: function () {
            return mimeType.indexOf("video") === 0;
        }
    };
};
