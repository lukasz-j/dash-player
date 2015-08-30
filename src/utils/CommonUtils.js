Dash.utils.CommonUtils = {
    computeBandwidth: function (requestOptions) {
        'use strict';
        return Math.ceil((requestOptions.size * 8) / (requestOptions.duration / 1000));
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
    },

    prettyPrintFileSize: function (sizeInBytes) {
        'use strict';

        var units = ['B', 'KB', 'MB'],
            output = sizeInBytes,
            index = 0;

        while (index < units.length && output >= 1024) {
            output /= 1024;
            index += 1;
        }

        if (index > 0) {
            return output.toFixed(2) + ' ' + units[index];
        } else {
            return Math.ceil(output) + ' ' + units[index];
        }
    },

    prettyPrintDownloadDuration: function (durationInMs) {
        'use strict';

        if (durationInMs >= 1000) {
            return (durationInMs / 1000).toFixed(3) + ' s';
        } else {
            return durationInMs + ' ms';
        }
    }
};
