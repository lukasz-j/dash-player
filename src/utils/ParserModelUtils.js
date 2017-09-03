Dash.utils.ParserModelUtils = {
    isURLAbsolute: function (URL) {
        'use strict';
        return (URL.indexOf('http://') === 0 || URL.indexOf('https://') === 0);
    },

    convertXMLDurationFormat: function (xmlFormatDuration) {
        'use strict';

        var computeValueFromGroup = function (durationMatchedGroup, index) {
            if (typeof  durationMatchedGroup === 'undefined') {
                return 0;
            } else {
                var value = parseFloat(durationMatchedGroup.substr(0, durationMatchedGroup.length - 1));
                if (index === 1) {
                    return value * 3600;
                } else if (index === 2) {
                    return value * 60;
                } else {
                    return value;
                }
            }
        };

        var value = 0,
            index = 0,
            xmlFormatPattern = /PT(\d+H)?(\d+M)?(\d+(\.\d+)?S)/i,
            matchArrayResult = xmlFormatPattern.exec(xmlFormatDuration);

        if (matchArrayResult !== null) {
            for (index = 1; index <= 3; index += 1) {
                value += computeValueFromGroup(matchArrayResult[index], index);
            }
        } else {
            throw new Error('Wrong format for xml duration - ' + xmlFormatDuration);
        }

        return value;
    },

    replaceAmpersandsInURL: function (url) {
        'use strict';
        return url.replace(/&amp;/g, '&');
    },

    getBaseURLFromNode: function (node) {
        'use strict';

        var baseURLNode = this.findDirectChildByTagName(node, 'BaseURL');
        if (typeof baseURLNode !== 'undefined') {
            return this.replaceAmpersandsInURL(baseURLNode.innerHTML).trim();
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
            return baseURL + '/' + rawURL;
        }
    },

    findDirectChildrenByTagName: function (node, tagName) {
        'use strict';

        var children = node.childNodes,
            matchingNodes = [];
        for (var i = 0; i < children.length; i += 1) {
            if (children[i].tagName === tagName) {
                matchingNodes.push(children[i]);
            }
        }

        return matchingNodes;
    },

    findDirectChildByTagName: function (node, tagName) {
        'use strict';

        return this.findDirectChildrenByTagName(node, tagName)[0];
    },

    getDigitAttribute: function (node, attributeName) {
        'use strict';

        var attributeValue = node.getAttribute(attributeName);

        if (typeof attributeValue !== 'undefined') {
            return parseInt(attributeValue, 10);
        }
    },

    createURLWithRange: function (baseURL, startIndex, endIndex) {
        'use strict';
        return baseURL + '&range=' + startIndex + '-' + endIndex;
    },

    extractUInt32FromByteArray: function(ba, startOffset) {
        return ba[startOffset] * 16777216 + ba[startOffset + 1] *
                65536 + ba[startOffset + 2] * 256 + ba[startOffset + 3];
    },

    findSegmentRangedInBaseSegment: function (initializationHeader, segmentBaseStartIndex, segmentBaseEndIndex) {
        var sampleLengths = [],
            segmentDurations = [],
            segmentBase = initializationHeader.subarray(segmentBaseStartIndex, segmentBaseEndIndex + 1),

            segmentRanges = [],
            startIndex = segmentBaseEndIndex + 1,
            i;

        // get timescale from
        var timeScale = this.extractUInt32FromByteArray(segmentBase, 16),
                segmentDuration;
        // at 32th byte of box subsegments are starting, each taking 12 bytes
        // first 4 bytes are length in bytes, next 4 bytes are duration
        // (seconds = duration / timeScale)
        for (i = 32; i < segmentBase.length; i += 12) {
            sampleLengths.push(this.extractUInt32FromByteArray(segmentBase, i) - 1);
            segmentDuration = this.extractUInt32FromByteArray(segmentBase, i + 4);
            segmentDurations.push(segmentDuration / timeScale);
        }

        for (i = 0; i < sampleLengths.length; i += 1) {
            segmentRanges.push({begin: startIndex, end: startIndex + sampleLengths[i], duration: segmentDurations[i]});
            startIndex += sampleLengths[i] + 1;
        }

        return segmentRanges;
    }
};
