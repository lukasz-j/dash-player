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
    },

    convertDurationInSecondsToPrettyString: function (durationInSeconds) {
        'use strict';
        var hours = Math.floor(durationInSeconds / 3600),
            minutes = Math.floor(durationInSeconds / 60) % 60,
            seconds = Math.floor(durationInSeconds % 60),
            milliSeconds = Math.floor((durationInSeconds % 1) * 100),
            outputString = '',

            fillNumberWithZeros = function (number, isFirst) {
                if (number < 10 && !isFirst) {
                    return '0' + number;
                } else {
                    return number.toString();
                }
            };

        if (hours !== 0) {
            outputString += fillNumberWithZeros(hours, true) + ':';
        }
        if (minutes !== 0 || outputString.length > 0) {
            outputString += fillNumberWithZeros(minutes, outputString.length === 0) + ':';
        }
        outputString += fillNumberWithZeros(seconds, outputString.length === 0);

        if (milliSeconds !== 0) {
            outputString += '.' + milliSeconds;
        }

        return outputString;
    }
};
