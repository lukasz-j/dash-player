Dash.model.MPDType = {
    STATIC: {id: 1, name: 'static'},
    DYNAMIC: {id: 2, name: 'dynamic'},

    createMPDTypeFromString: function (stringMPDType) {
        'use strict';
        var property;

        if (!stringMPDType) {
            return this.STATIC;
        }

        for (property in this) {
            if (this.hasOwnProperty(property) && typeof property !== "function") {
                if (this[property].name === stringMPDType) {
                    return this[property];
                }
            }
        }
        throw new Error('Illegal MPD type - ' + stringMPDType);
    }
};