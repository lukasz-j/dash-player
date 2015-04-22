Dash.utils.CommonUtils = {
    createURLWithRange: function (baseURL, startIndex, endIndex) {
        'use strict';
        return baseURL + '&range=' + startIndex + '-' + endIndex;
    },

    computeDownloadSpeed: function (bytes, miliseconds) {
        'use strict';
        return (bytes / 1024) / (miliseconds / 1000);
    },

    replaceAmpersandsInURL: function (url) {
        'use strict';
        return url.replace(/&amp;/g, '&');
    },

    createSourceBufferInitString: function (adaptationSet, representation) {
        'use strict';
        return adaptationSet.getMimeType() + '; codecs="' + representation.getCodecs() + '"';
    }
};
