Dash.utils.ParserModelUtils = {
    isURLAbsolute: function (URL) {
        'use strict';
        return (URL.indexOf('http://') === 0 || URL.indexOf('https://') === 0);
    },

    convertXMLDurationFormat: function (xmlDurationFormat) {
        'use strict';
        //todo implement me and move to separate file with other utils
        return xmlDurationFormat;
    },

    replaceAmpersandsInURL: function (url) {
        'use strict';
        return url.replace(/&amp;/g, '&');
    },

    getBaseURLFromParentNode: function (parentNode) {
        'use strict';

        var baseURLNode = parentNode.getElementsByTagName('BaseURL')[0];
        if (typeof (baseURLNode) !== 'undefined') {
            return this.replaceAmpersandsInURL(baseURLNode.innerHTML);
        }
    },

    findBaseURLInModel: function (element) {
        'use strict';

        var parent = element,
            baseURL;

        while (parent) {
            if (typeof parent.getBaseURL === 'function') {
                baseURL = parent.getBaseURL();

                if (typeof baseURL !== 'undefined') {
                    return baseURL;
                }
            }
            parent = parent.getParent();
        }
    },

    resolveAttributeURL: function (baseURL, attributeURL) {
        'use strict';

        var rawURL = decodeURIComponent(attributeURL);

        if (this.isURLAbsolute(rawURL)) {
            return rawURL;
        } else {
            return rawURL + '/' + rawURL;
        }
    }
};
