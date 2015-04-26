Dash.model.MediaType = {
    VIDEO: {id: 1, name: 'video'},
    AUDIO: {id: 2, name: 'audio'},
    TEXT: {id: 3, name: 'text'},

    createMediaTypeFromMimeType: function (mimeType) {
        'use strict';
        var property,
            stringMediaType = mimeType.split('/')[0];

        for (property in this) {
            if (this.hasOwnProperty(property) && typeof property !== "function") {
                if (this[property].name === stringMediaType) {
                    return this[property];
                }
            }
        }
        throw new Error('Unsupported media type - ' + stringMediaType);
    }
};