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

    var _period = undefined,
        _mediaPresentationDuration = convertXMLDurationFormat(rawMediaPresentationDuration);

    return {
        name: 'MPD',

        setPeriod: function (period) {
            _period = period;
        },

        getPeriod: function () {
            return _period;
        },

        getProfiles: function () {
            return profiles;
        },

        getType: function () {
            return type || "static";
        },

        getMediaPresentationDuration: function () {
            return _mediaPresentationDuration;
        },

        getMinBufferTime: function () {
            return minBufferTime;
        }
    };
};