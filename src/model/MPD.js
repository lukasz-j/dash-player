/* Model structure
 MPD
 |- Period (1:1)
 |-AdaptationSet (1:n)
 |-Representation (1:n)
 |-ListSegment|RangeSegment (1:1)
 */


Dash.model.MPD = function (profiles, type, rawMediaPresentationDuration, minBufferTime) {
    'use strict';

    function convertXMLDurationFormat(xmlDurationFormat) {
        //todo implement me and move to separate file with other utils
        return xmlDurationFormat;
    }

    var period,
        mediaPresentationDuration = convertXMLDurationFormat(rawMediaPresentationDuration);

    return {
        name: 'MPD',

        setPeriod: function (newPeriod) {
            period = newPeriod;
        },

        getPeriod: function () {
            return period;
        },

        getProfiles: function () {
            return profiles;
        },

        getType: function () {
            return type || "static";
        },

        getMediaPresentationDuration: function () {
            return mediaPresentationDuration;
        },

        getMinBufferTime: function () {
            return minBufferTime;
        }
    };
};