Dash.model.MPDProfile = {
    FULL: {value: 0, name: 'full', urn: 'urn:mpeg:dash:profile:full:2011'},
    ONDEMAND: {value: 1, name: 'on-demand', urn: 'urn:mpeg:dash:profile:isoff-on-demand:2011'},
    LIVE: {value: 2, name: 'dynamic', unr: 'urn:mpeg:dash:profile:isoff-live:2011'},
    MAIN: {value: 3, name: 'main', urn: 'urn:mpeg:dash:profile:isoff-main:2011'},


    createMPDProfileFromString: function (profileURN) {
        'use strict';
        var property;

        for (property in this) {
            if (this.hasOwnProperty(property) && typeof property !== "function") {
                if (this[property].urn === profileURN) {
                    return this[property];
                }
            }
        }
        throw new Error('Illegal MPD profile urn - ' + profileURN);
    }
};