/* Model structure
 MPD
 |-Period (1:1) //multiple periods are not supported for now
 |-AdaptationSet (1:n)
 |-Representation (1:n)
 |-ListSegment|RangeSegment|TemplateSegment (1:1)
 */

Dash.model.MPD = function (mpdNode, mpdFileURL) {
    'use strict';

    var findBaseURL = function (baseURLNode, mpdFileURL) {
            if (typeof baseURLNode === 'undefined' || baseURLNode.innerHTML === './') {
                //if base URL node is absent then use url from mpd file
                var lastSlash = mpdFileURL.lastIndexOf('/');
                return mpdFileURL.substr(0, lastSlash);
            } else {
                return Dash.utils.ParserModelUtils.replaceAmpersandsInURL(baseURLNode.innerHTML);
            }
        },

        getAllProfilesFromAttribute = function (profilesAttribute) {
            //fixme
            return [Dash.model.MPDProfile.createMPDProfileFromString(profilesAttribute)];
        };

    var profilesAttribute = mpdNode.getAttribute("profiles"),
        typeAttribute = mpdNode.getAttribute("type"),
        mediaPresentationDurationAttribute = mpdNode.getAttribute("mediaPresentationDuration"),//
        minBufferTimeAttribute = mpdNode.getAttribute("minBufferTime"),
        baseURLNode = Dash.utils.ParserModelUtils.findDirectChildByTagName(mpdNode, 'BaseURL');

    var period,
        baseURL = findBaseURL(baseURLNode, mpdFileURL),
        type = Dash.model.MPDType.createMPDTypeFromString(typeAttribute),
        mediaPresentationDuration = Dash.utils.ParserModelUtils.convertXMLDurationFormat(mediaPresentationDurationAttribute),
        minBufferTime = Dash.utils.ParserModelUtils.convertXMLDurationFormat(minBufferTimeAttribute),
        profiles = getAllProfilesFromAttribute(profilesAttribute);

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

        getProfilesAsString: function () {
            return profiles.map(function (element) {
                return element.name + ' ';
            });
        },

        getType: function () {
            return type;
        },

        getBaseURL: function () {
            return baseURL;
        },

        getMediaPresentationDuration: function () {
            return mediaPresentationDuration;
        },

        getMediaPresentationDurationFormatted: function () {
            return Dash.utils.CommonUtils.convertDurationInSecondsToPrettyString(mediaPresentationDuration);
        },

        getMinBufferTime: function () {
            return minBufferTime;
        },

        getMinBufferTimeFormatted: function () {
            return Dash.utils.CommonUtils.convertDurationInSecondsToPrettyString(minBufferTime);
        }
    };
};