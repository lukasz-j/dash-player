Dash.model.MediaFormat = {
    MP4: {value: 1, name: 'mp4'},
    WEBM: {value: 2, name: 'webm'},
    VTT: {value: 3, name: 'vtt'},

    createMediaFormatFromMimeType: function (mimeType) {
        'use strict';
        var property,
            stringMediaFormat = mimeType.split('/')[1];

        for (property in this) {
            if (this.hasOwnProperty(property) && typeof property !== "function") {
                if (this[property].name === stringMediaFormat) {
                    return this[property];
                }
            }
        }
        throw new Error('Unsupported media format - ' + stringMediaFormat);
    }
};
