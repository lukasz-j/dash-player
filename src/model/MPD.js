/* Model structure
 MPD
 |- Period (1:1)
 |-AdaptationSet (1:n)
 |-Representation (1:n)
 |-ListSegment|RangeSegment (1:1)
 */


Dash.model.MPD = function (profiles, type, rawMediaPresentationDuration, minBufferTime) {
    function convertXMLDurationFormat(xmlDurationFormat) {
        //todo implement me and move to separate file with other utils
        return xmlDurationFormat;
    }

    var period = undefined,
        mediaPresentationDuration = convertXMLDurationFormat(rawMediaPresentationDuration);

    return {
        /* DEBUG ONLY, use methods instead of fields */
        _period: undefined,
        _mediaPresentationDuration: mediaPresentationDuration,
        /*******/

        name: 'MPD',

        setPeriod: function (newPeriod) {
            period = newPeriod;
            this._period = newPeriod;
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