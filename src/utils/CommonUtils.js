Dash.utils.CommonUtils = {
    computeDownloadSpeed: function (bytes, miliseconds) {
        'use strict';
        return (bytes * 8) / (miliseconds / 1000); // bits per second
    },

    createSourceBufferInitString: function (adaptationSet, representation) {
        'use strict';
        var codecs;
        if (adaptationSet.getCodecs()) {
            codecs = adaptationSet.getCodecs();
        } else {
            codecs = representation.getCodecs();
        }

        return adaptationSet.getMimeType() + '; codecs="' + codecs + '"';
    },

    escapeRegExp: function (string) {
        'use strict';
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },

    replaceAll: function (string, find, replace) {
        'use strict';
        return string.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
};
