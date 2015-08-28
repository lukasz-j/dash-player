// Common namespace for all DASH scripts
var Dash = {
    model: {},
    mpd: {},
    streaming: {},
    log: {},
    utils: {},
    event: {}
};


Dash.Player = function (videoElement, $window, eventBus) {
    'use strict';

    var playbackManager,
        adaptationManager,
        adaptationSetPicker,
        initRepresentationPicker,

        initializeStreaming = function (mpdModel) {
            var mediaSource,
                url;

            if ($window.MediaSource) {
                mediaSource = new $window.MediaSource();
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.ERROR, 'MediaSource API is not supported by your browser, cannot continue');
                return;
            }

            url = URL.createObjectURL(mediaSource);

            videoElement.pause();
            videoElement.src = url;

            initRepresentationPicker = Dash.streaming.DefaultInitRepresentationPicker();

            mediaSource.addEventListener('sourceopen', function () {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'MediaSource successfully open');
                playbackManager = Dash.streaming.PlaybackManager(mpdModel, mediaSource, eventBus, adaptationManager,
                    adaptationSetPicker, initRepresentationPicker);
            }, false);
        },

        onSuccessMpdDownloadCallback = function (request, loadedBytes, options) {
            var mpdModel = Dash.mpd.Parser(eventBus).generateModel(request.responseText, options.url, options.isYouTube);

            if (typeof mpdModel === 'undefined') {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.ERROR, 'Model generated from mpd file is empty, cannot continue');
            } else {
                eventBus.dispatchEvent({type: Dash.event.Events.MPD_LOADED, value: mpdModel});
                initializeStreaming(mpdModel);
            }
        };

    return {
        load: function (url, isYouTube) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG,
                'Trying to load MPD file from ' + url + '. URL will be considered as ' + (isYouTube ? 'YouTube movie' : 'mpd file'));
            Dash.mpd.Downloader(url, isYouTube, onSuccessMpdDownloadCallback, eventBus).downloadMpdFile();
        },

        changeRepresentationToLower: function (mediaType, steps) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received changing representation to lower request for ' + mediaType.name);
            playbackManager.changeRepresentationToLower(mediaType, steps);
        },

        changeRepresentationToHigher: function (mediaType, steps) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received changing representation to higher request for ' + mediaType.name);
            playbackManager.changeRepresentationToHigher(mediaType, steps);
        },

        changeRepresentation: function (mediaType, representationId) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received changing representation to representation with id ' + representationId + ' for ' + mediaType.name);
            playbackManager.changeRepresentation(mediaType, representationId);
        },

        disableAdaptation: function () {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received disabling adaptation request');
            playbackManager.disableAdaptation();
        },

        enableAdaptation: function (adaptationAlgorithmName) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received enabling adaptation request, using ' + adaptationAlgorithmName + ' method');
            playbackManager.enableAdaptation(adaptationAlgorithmName);
        }
    };
};

Dash.event.EventBus = function () {
    'use strict';

    var registeredListeners = {}, //Map<EventStringName, List<ListenerFunctions>>

        findListenersForEventType = function (type) {
            if (!registeredListeners.hasOwnProperty(type)) {
                registeredListeners[type] = [];
            }
            return registeredListeners[type];
        };

    return {
        addEventListener: function (type, listener) {
            var availableListeners = findListenersForEventType(type);

            if (availableListeners.indexOf(listener) === -1) {
                availableListeners.push(listener);
                return true;
            } else {
                return false;
            }
        },

        removeEventListener: function (type, listener) {
            var availableListeners = findListenersForEventType(type),
                listenerIndex = availableListeners.indexOf(listener);

            if (listenerIndex > -1) {
                availableListeners.splice(listenerIndex, 1);
                return true;
            } else {
                return false;
            }

        },

        dispatchEvent: function (event) {
            var availableListeners = findListenersForEventType(event.type);

            for (var i = 0; i < availableListeners.length; i += 1) {
                availableListeners[i].call(this, event);
            }
        },

        dispatchLogEvent: function (level, message) {
            this.dispatchEvent({type: Dash.event.Events.LOG_MESSAGE, value: {level: level, message: message}});
        }
    };
};

Dash.event.Events = {
    MPD_LOADED: 'mpdLoaded',
    ADAPTATION_SET_INITIALIZED: 'adaptationSetInitialized',
    REPRESENTATION_INITIALIZED: 'representationInitialized',
    REPRESENTATION_CHANGED: 'representationChanged',
    LOG_MESSAGE: 'logMessage',
    SEGMENT_DOWNLOADED: 'segmentDownloaded'
};
Dash.log.ConsoleLogger = function ($console) {
    'use strict';

    var logMessageToConsole = function (level, message) {
        switch (level) {
            case Dash.log.LogLevel.DEBUG:
                $console.debug(message);
                break;
            case Dash.log.LogLevel.INFO:
                $console.info(message);
                break;
            case Dash.log.LogLevel.WARN:
                $console.warn(message);
                break;
            case Dash.log.LogLevel.ERROR:
                $console.error(message);
                break;
        }
    };

    return {
        onMessageReceived: function (event) {
            logMessageToConsole(event.value.level, event.value.message);
        },

        logMessage: function (level, message) {
            logMessageToConsole(level, message);
        }
    };
};

Dash.log.LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};
Dash.model.AdaptationSet = function (adaptationSetNode, period) {
    'use strict';

    var representations,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromNode(adaptationSetNode),
        codecs = adaptationSetNode.getAttribute('codecs'),
        width = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'width'),
        height = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'height'),
        frameRate = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'frameRate'),
        audioSamplingRate = Dash.utils.ParserModelUtils.getDigitAttribute(adaptationSetNode, 'audioSamplingRate'),
        mimeType,
        mediaFormat,
        mediaType,

        initializeMediaInformationBaseOnRepresentations = function (representations) {
            //temporary fix
            if (adaptationSetNode.hasAttribute('mimeType')) {
                mimeType = adaptationSetNode.getAttribute('mimeType');
            } else {
                mimeType = representations[0].getMimeType();
            }

            mediaFormat = Dash.model.MediaFormat.createMediaFormatFromMimeType(mimeType);
            mediaType = Dash.model.MediaType.createMediaTypeFromMimeType(mimeType);
        };

    return {
        name: 'AdaptationSet',

        setRepresentations: function (newRepresentation) {
            representations = newRepresentation;
            initializeMediaInformationBaseOnRepresentations(representations);
        },

        getRepresentations: function () {
            return representations;
        },

        getParent: function () {
            return period;
        },

        getBaseURL: function () {
            return baseURL;
        },

        getIndexOfRepresentation: function (representation) {
            for (var i = 0; i < representations.length; i += 1) {
                if (representations[i].equals(representation)) {
                    return i;
                }
            }
        },

        getLowestRepresentation: function () {
            return representations[0];
        },

        getHighestRepresentation: function () {
            return representations[representations.length - 1];
        },

        getRepresentationByWidth: function (width) {
            for (var i = 0; i < representations.length; i += 1) {
                var representation = representations[i];
                if (representation.getWidth() === width) {
                    return representation;
                }
            }
        },

        getRepresentationShortForms: function () {
            return representations.map(function (element) {
                return element.toShortForm();
            });
        },

        getMimeType: function () {
            return mimeType;
        },

        getFormat: function () {
            return mediaFormat;
        },

        getCodecs: function () {
            return codecs;
        },

        getWidth: function () {
            return width;
        },

        getHeight: function () {
            return height;
        },

        getFrameRate: function () {
            return frameRate;
        },

        getAudioSamplingRate: function () {
            return audioSamplingRate;
        },

        getMediaType: function () {
            return mediaType;
        },

        isVideo: function () {
            return mediaType === Dash.model.MediaType.VIDEO;
        },

        isAudio: function () {
            return mediaType === Dash.model.MediaType.AUDIO;
        },

        isText: function () {
            return mediaType === Dash.model.MediaType.TEXT;
        }
    };
};


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
Dash.model.Period = function (periodNode, mpdElement) {
    'use strict';

    var isAdaptationSetAudioCondition = function (adaptationSet) {
            return adaptationSet.isAudio();
        },

        isAdaptationSetVideoCondition = function (adaptationSet) {
            return adaptationSet.isVideo();
        },

        isAdaptationSetTextCondition = function (adaptationSet) {
            return adaptationSet.isText();
        },

        filterAdaptationSets = function (conditionFunction) {
            var sets = [];
            for (var i = 0; i < adaptationSets.length; i += 1) {
                if (conditionFunction(adaptationSets[i])) {
                    sets.push(adaptationSets[i]);
                }
            }
            return sets;
        };

    var adaptationSets,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromNode(periodNode);

    return {
        name: 'Period',

        setAdaptationSets: function (newAdaptationSets) {
            adaptationSets = newAdaptationSets;
        },

        getAdaptationSets: function () {
            return adaptationSets;
        },

        getParent: function () {
            return mpdElement;
        },

        getBaseURL: function () {
            return baseURL;
        },

        getAdaptationSet: function (mediaType, format) {
            if (mediaType === Dash.model.MediaType.VIDEO) {
                return this.getVideoAdaptationSet(format);
            } else if (mediaType === Dash.model.MediaType.AUDIO) {
                return this.getAudioAdaptationSet(format);
            } else {
                throw new Error('Unsupported adaptation set format - ' + mediaType);
            }
        },

        getAudioAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetAudioCondition);
        },

        getVideoAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetVideoCondition);
        },

        getTextAdaptationSets: function () {
            return filterAdaptationSets(isAdaptationSetTextCondition);
        },

        getAudioAdaptationSet: function (format) {
            for (var i = 0; i < adaptationSets.length; i += 1) {
                if (adaptationSets[i].isAudio() && adaptationSets[i].getFormat() === format) {
                    return adaptationSets[i];
                }
            }
        },

        getVideoAdaptationSet: function (format) {
            for (var i = 0; i < adaptationSets.length; i += 1) {
                if (adaptationSets[i].isVideo() && adaptationSets[i].getFormat() === format) {
                    return adaptationSets[i];
                }
            }
        }
    };
};
Dash.model.Representation = function (representationNode, adaptationSet) {
    'use strict';

    var segment,
        baseURL = Dash.utils.ParserModelUtils.getBaseURLFromNode(representationNode),
        id = representationNode.getAttribute('id'),
        codecs = representationNode.getAttribute('codecs'),
        bandwidth = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'bandwidth'),
        width = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'width'),
        height = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'height'),
        frameRate = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'frameRate'),
        audioSamplingRate = Dash.utils.ParserModelUtils.getDigitAttribute(representationNode, 'audioSamplingRate'),
        mimeType = representationNode.getAttribute('mimeType');

    return {
        name: 'Representation',

        orderNumber: 0,

        setSegment: function ($segment) {
            segment = $segment;
        },

        getSegment: function () {
            return segment;
        },

        getParent: function () {
            return adaptationSet;
        },

        getBaseURL: function () {
            return baseURL;
        },

        getAdaptationSet: function () {
            return adaptationSet;
        },

        getMimeType: function () {
            return mimeType || adaptationSet.getMimeType();
        },

        getId: function () {
            return id;
        },

        getBandwidth: function () {
            return bandwidth;
        },

        getWidth: function () {
            if (width) {
                return width;
            } else {
                return adaptationSet.getWidth();
            }
        },

        getHeight: function () {
            if (height) {
                return height;
            } else {
                return adaptationSet.getHeight();
            }
        },

        getFrameRate: function () {
            if (frameRate) {
                return frameRate;
            } else {
                return adaptationSet.getFrameRate();
            }
        },

        getCodecs: function () {
            if (codecs) {
                return codecs;
            } else {
                return adaptationSet.getCodecs();
            }
        },

        getAudioSamplingRate: function () {
            if (audioSamplingRate) {
                return audioSamplingRate;
            } else {
                return adaptationSet.getAudioSamplingRate();
            }
        },

        toShortForm: function () {
            if (height) {
                if (frameRate) {
                    return height + ' @ ' + frameRate + 'fps';
                } else {
                    return String(height);
                }
            } else if (audioSamplingRate) {
                return (audioSamplingRate / 1000).toFixed(1) + 'kHz @ ' + (bandwidth / 1000).toFixed(2) + 'kbps';
            } else {
                return bandwidth / 1000 + 'kbps';
            }

        },

        //Different representations should have different ids
        equals: function (representation) {
            return id === representation.getId();
        }
    };
};
Dash.model.MPDProfile = {
    FULL: {value: 0, name: 'full', urn: 'urn:mpeg:dash:profile:full:2011'},
    ONDEMAND: {value: 1, name: 'on-demand', urn: 'urn:mpeg:dash:profile:isoff-on-demand:2011'},
    LIVE: {value: 2, name: 'dynamic', urn: 'urn:mpeg:dash:profile:isoff-live:2011'},
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
Dash.model.MPDType = {
    STATIC: {value: 1, name: 'static'},
    DYNAMIC: {value: 2, name: 'dynamic'},

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

Dash.model.MediaType = {
    VIDEO: {value: 1, name: 'video'},
    AUDIO: {value: 2, name: 'audio'},
    TEXT: {value: 3, name: 'text'},

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
Dash.model.ListSegment = function (segmentListNode, representation) {
    'use strict';

    var findInitializationURL = function (baseURL, segmentListNode) {
            var initializationNode = segmentListNode.getElementsByTagName('Initialization')[0],
                initializationURLAttribute = initializationNode.getAttribute('sourceURL');

            return Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, initializationURLAttribute);
        },

        findSegmentURLs = function (baseURL, segmentListNode) {
            var segmentURLNodeList = segmentListNode.getElementsByTagName('SegmentURL'),
                segmentURLList = [],
                segmentURLAttribute;

            for (var i = 0; i < segmentURLNodeList.length; i += 1) {
                segmentURLAttribute = segmentURLNodeList[i].getAttribute('media');
                segmentURLList.push(Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, segmentURLAttribute));
            }

            return segmentURLList;
        };

    var baseURL = Dash.utils.ParserModelUtils.findBaseURLInModel(representation),
        initializationURL = findInitializationURL(baseURL, segmentListNode),
        segmentURLs = findSegmentURLs(baseURL, segmentListNode);

    return {
        name: 'ListSegment',

        getParent: function () {
            return representation;
        },

        getInitializationURL: function () {
            return initializationURL;
        },

        getSegmentURLs: function () {
            return segmentURLs;
        }
    };
};
Dash.model.RangeSegment = function (segmentBaseNode, representation, useBytesRangeInURL) {
    'use strict';

    var initializationIndexRange = segmentBaseNode.getElementsByTagName('Initialization')[0].getAttribute('range'),
        segmentBaseIndexRange = segmentBaseNode.getAttribute("indexRange"),

        baseURL = representation.getBaseURL(),

        splitInitializationIndexRange = initializationIndexRange.split('-'),
        splitSegmentBaseIndexRange = segmentBaseIndexRange.split('-'),

        initializationStartIndex = parseInt(splitInitializationIndexRange[0], 10),
        initializationEndIndex = parseInt(splitInitializationIndexRange[1], 10),

        segmentBaseStartIndex = parseInt(splitSegmentBaseIndexRange[0], 10),
        segmentBaseEndIndex = parseInt(splitSegmentBaseIndexRange[1], 10),

        segmentRangeList;

    var toRangeString = function (rangeObject) {
            return rangeObject.begin + '-' + rangeObject.end;
        },

        getInitializationSegmentRange = function () {
            return {begin: initializationStartIndex, end: segmentBaseEndIndex};
        },

        getSegmentsRange = function (initialization) {
            var sampleLengths = [],
                segmentBase = initialization.subarray(segmentBaseStartIndex, segmentBaseEndIndex + 1),

                segmentRanges = [],
                startIndex = segmentBaseEndIndex + 1,
                i;

            for (i = 32; i < segmentBase.length; i += 12) {
                sampleLengths.push(segmentBase[i] * 16777216 + segmentBase[i + 1] *
                    65536 + segmentBase[i + 2] * 256 + segmentBase[i + 3] - 1);
            }

            for (i = 0; i < sampleLengths.length; i += 1) {
                segmentRanges.push({begin: startIndex, end: startIndex + sampleLengths[i]});
                startIndex += sampleLengths[i] + 1;
            }

            return segmentRanges;
        };


    if (!Dash.utils.ParserModelUtils.isURLAbsolute(baseURL)) {
        var url = Dash.utils.ParserModelUtils.findBaseURLInModel(representation.getParent().getParent());
        baseURL = Dash.utils.ParserModelUtils.resolveAttributeURL(url, baseURL);
    }

    return {
        name: 'RangeSegment',

        getRepresentation: function () {
            return representation;
        },

        computeSegmentRanges: function (initializationHeader) {
            segmentRangeList = getSegmentsRange(initializationHeader);
        },

        getInitializationURL: function () {
            var initializationRange = getInitializationSegmentRange();

            if (useBytesRangeInURL) {
                return Dash.utils.ParserModelUtils.createURLWithRange(baseURL, initializationRange.begin, initializationRange.end);
            } else {
                return {url: baseURL, range: toRangeString(initializationRange)};
            }
        },

        getSegmentURLs: function () {
            var segmentURLsWithRanges = [],
                index;

            if (!segmentRangeList) {
                return [];
            }

            if (useBytesRangeInURL) {
                for (index = 0; index < segmentRangeList.length; index += 1) {
                    segmentURLsWithRanges.push(Dash.utils.ParserModelUtils.createURLWithRange(baseURL, segmentRangeList[index].begin, segmentRangeList[index].end));
                }
            } else {
                for (index = 0; index < segmentRangeList.length; index += 1) {
                    segmentURLsWithRanges.push({url: baseURL, range: toRangeString(segmentRangeList[index])});
                }
            }

            return segmentURLsWithRanges;
        },

        getHeaderStartIndex: function () {
            return initializationStartIndex;
        },

        getHeaderEndIndex: function () {
            return segmentBaseEndIndex;
        },

        getInitializationStartIndex: function () {
            return initializationStartIndex;
        },

        getInitializationEndIndex: function () {
            return initializationEndIndex;
        },

        getSegmentBaseStartIndex: function () {
            return segmentBaseStartIndex;
        },

        getSegmentBaseEndIndex: function () {
            return segmentBaseEndIndex;
        }
    };
};
Dash.model.TemplateSegment = function (segmentTemplateNode, representation) {
    'use strict';

    var identifiers = {
            doubleDollar: '$$',
            representation: '$RepresentationID$',
            bandwidth: '$Bandwidth',
            number: '$Number$',
            time: '$Time$'
        },

        computeSegmentCount = function (videoDuration, segmentDuration, timescale) {
            var segmentDurationInSeconds = segmentDuration / timescale;
            return Math.ceil(videoDuration / segmentDurationInSeconds);
        },

        substituteCommonIdentifiersInURL = function (template, representationId, bandwidth) {
            var replacedDollars = Dash.utils.CommonUtils.replaceAll(template, identifiers.doubleDollar, ''),
                replacedRepresentationId = Dash.utils.CommonUtils.replaceAll(replacedDollars, identifiers.representation, representationId),
                replacedBandwidth = Dash.utils.CommonUtils.replaceAll(replacedRepresentationId, identifiers.bandwidth, bandwidth);

            return replacedBandwidth;
        },

        computeTimeBasedSegmentURLs = function (template, baseURL, segmentDuration, numberOfSegments) {
            var segmentURLList = [];
            for (var i = 0; i < numberOfSegments; i += 1) {
                var replacementTimeValue = i * segmentDuration;

                var replacedCommonIdentifiers = substituteCommonIdentifiersInURL(template, representation.getId(), representation.getBandwidth()),
                    substitutedURL = Dash.utils.CommonUtils.replaceAll(replacedCommonIdentifiers, identifiers.time, replacementTimeValue);

                segmentURLList.push(Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, substitutedURL));
            }

            return segmentURLList;
        },

        computeNumberBasedSegmentURLs = function (template, baseURL, startSegment, numberOfSegments) {
            var segmentURLList = [];
            for (var i = 0; i < numberOfSegments; i += 1) {
                //fixme this approach has not been tested yet
                //Is it a proper way of resolving number identifier in template?
                var replacementNumberValue = i + startSegment;

                var replacedCommonIdentifiers = substituteCommonIdentifiersInURL(template, representation.getId(), representation.getBandwidth()),
                    substitutedURL = Dash.utils.CommonUtils.replaceAll(replacedCommonIdentifiers, identifiers.number, replacementNumberValue);

                segmentURLList.push(Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, substitutedURL));
            }

            return segmentURLList;
        },

        findDurationForRepresentation = function (representation) {
            return representation.getParent().getParent().getParent().getMediaPresentationDuration();
        };

    var baseURL = Dash.utils.ParserModelUtils.findBaseURLInModel(representation),
        templateURL = segmentTemplateNode.getAttribute('media'),
        timescale = parseInt(segmentTemplateNode.getAttribute('timescale'), 10),
        initializationURLAttribute = segmentTemplateNode.getAttribute('initialization'),
        initializationURL = Dash.utils.ParserModelUtils.resolveAttributeURL(baseURL, initializationURLAttribute),
        duration = findDurationForRepresentation(representation),
        segmentURLs = [],

        segmentDuration,
        numberOfSegments;


    if (templateURL.indexOf(identifiers.time) > -1) {
        var sNode = segmentTemplateNode.getElementsByTagName('S')[0];

        segmentDuration = parseInt(sNode.getAttribute('d'), 10);
        numberOfSegments = computeSegmentCount(duration, segmentDuration, timescale);

        segmentURLs = computeTimeBasedSegmentURLs(templateURL, baseURL, segmentDuration, numberOfSegments);
    } else if (templateURL.indexOf(identifiers.number) > -1) {
        //fixme implement support for number based templates
        var startNumber = parseInt(segmentTemplateNode.getElementsByTagName('startNumber')[0], 10) || 1;

        segmentDuration = parseInt(segmentTemplateNode.getAttribute('duration'), 10);
        numberOfSegments = computeSegmentCount(duration, segmentDuration, timescale);

        segmentURLs = computeNumberBasedSegmentURLs(templateURL, baseURL, startNumber, numberOfSegments);
    } else {
        throw new Error('Error template url format ' + templateURL);
    }

    return {
        name: 'TemplateSegment',

        getRepresentation: function () {
            return representation;
        },

        getTemplateURL: function () {
            return templateURL;
        },

        getInitializationURL: function () {
            return initializationURL;
        },

        getSegmentURLs: function () {
            return segmentURLs;
        }
    };
};

Dash.mpd.Downloader = function (mpdFileUrl, isYouTubeVideo, downloadMpdFileOnSuccess, eventBus) {
    'use strict';

    var youTubeDomain = 'http://www.youtube.com',
        getInfoMapping = '/get_video_info?html5=1&video_id=',
        videoIdPrefix = 'v=',
        mpdEntryPrefix = 'dashmpd=',
        asyncDownloader = Dash.utils.AsyncDownloader(),

        downloadMpdFileFromURL = function () {
            asyncDownloader.download(mpdFileUrl, downloadMpdFileOnSuccess);
        },

        getMpdUrlFromResponse = function (movieDetails) {
            var urlParameters = movieDetails.split('&');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(mpdEntryPrefix) === 0) {
                    var mpdUrl = decodeURIComponent(urlParameters[i].substring(mpdEntryPrefix.length));
                    eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, 'MPD url find in response from YouTube, ' + mpdUrl);
                    return mpdUrl;
                }
            }
            eventBus.dispatchLogEvent(Dash.log.LogLevel.ERROR, 'Cannot find mpd file localization for ' + mpdFileUrl +
                '. Server respond with: ' + decodeURIComponent(movieDetails));
        },

        downloadYouTubeMpdFile = function () {
            var videoId = getYouTubeVideoId(mpdFileUrl),
                url = youTubeDomain + getInfoMapping + videoId;
            asyncDownloader.download(url, downloadYouTubeVideoDetailsOnSuccess);
        },

        downloadYouTubeVideoDetailsOnSuccess = function (request) {
            var mpdUrl = getMpdUrlFromResponse(request.responseText);

            if (mpdUrl) {
                asyncDownloader.download(mpdUrl, function (request, loadedBytes, options) {
                    options.isYouTube = true;
                    downloadMpdFileOnSuccess(request, loadedBytes, options);
                });
            }
        },

        getYouTubeVideoId = function (videoUrl) {
            var urlParameters = videoUrl.split('?');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(videoIdPrefix) === 0) {
                    return urlParameters[i].substring(videoIdPrefix.length);
                }
            }
        };


    return {
        downloadMpdFile: function () {
            if (isYouTubeVideo) {
                downloadYouTubeMpdFile();
            } else {
                downloadMpdFileFromURL();
            }
        }
    };
};

Dash.mpd.Parser = function (eventBus) {
    'use strict';

    var createMPDElement = function (mpdNode, mpdFileURL) {
            var mpd = Dash.model.MPD(mpdNode, mpdFileURL),
                logMessage = 'Mpd element created from xml node, type: ' + mpd.getType().name +
                    ', profiles: ' + mpd.getProfilesAsString() + ', duration: ' + mpd.getMediaPresentationDurationFormatted();
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
            return mpd;
        },

        createPeriodElement = function (periodNode, mpdElement) {
            var period = Dash.model.Period(periodNode, mpdElement);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Period element created from xml node');
            return period;
        },

        createAdaptationSetElement = function (adaptationSetNode, periodElement) {
            var adaptationSet = Dash.model.AdaptationSet(adaptationSetNode, periodElement);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Adaptation set element created from xml node');
            return adaptationSet;
        },

        createRepresentationElement = function (representationNode, adaptationSetElement) {
            var representation = Dash.model.Representation(representationNode, adaptationSetElement),
                logMessage = 'Representation element created from xml node, id: ' +
                    representation.getId() + ', bandwidth: ' + representation.getBandwidth();
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
            return representation;
        },

        createSegmentElement = function (representationNode, representationElement, isYouTube) {
            var baseURL = representationElement.getBaseURL(),
                segmentTemplateNode = representationNode.getElementsByTagName('SegmentTemplate')[0],
                segmentBaseNode = representationNode.getElementsByTagName('SegmentBase')[0],
                segmentListNode = representationNode.getElementsByTagName('SegmentList')[0],
                segment,
                logMessage;

            if (baseURL && segmentBaseNode && !segmentTemplateNode && !segmentListNode) {
                //RANGE SEGMENT
                segment = Dash.model.RangeSegment(segmentBaseNode, representationElement, isYouTube);
                logMessage = 'Range segment element created from xml node, baseURL: ' + representationElement.getBaseURL();
            } else if (segmentListNode) {
                //LIST SEGMENT
                segment = Dash.model.ListSegment(segmentListNode, representationElement);
                logMessage = 'List segment element created from xml node, initialization url: ' + segment.getInitializationURL();
            } else if (segmentTemplateNode) {
                //TEMPLATE SEGMENT
                segment = Dash.model.TemplateSegment(segmentTemplateNode, representationElement);
                logMessage = 'Template segment element created from xml node, template url: ' + segment.getTemplateURL();
            } else if (baseURL) {
                //fixme to skip throwing exception for text/vtt
                return;
            } else {
                throw new Error("Unsupported segment representation");
            }

            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
            return segment;
        };

    return {
        generateModel: function (mpdFileContent, mpdFileURL, isYouTube) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Parsing downloaded mpd file using DOMParser');

            var parsedMpdFile = new DOMParser().parseFromString(mpdFileContent, "text/xml");

            //MPD
            var mpdNode = parsedMpdFile.getElementsByTagName("MPD")[0],
                mpdElement = createMPDElement(mpdNode, mpdFileURL);

            // PERIOD
            var periodNode = mpdNode.getElementsByTagName("Period")[0],
                periodElement = createPeriodElement(periodNode, mpdElement);
            mpdElement.setPeriod(periodElement);

            //ADAPTATION SET
            var adaptationSetNodes = periodNode.getElementsByTagName("AdaptationSet"),
                adaptationSetElements = [];

            for (var i = 0; i < adaptationSetNodes.length; ++i) {
                var adaptationSetNode = adaptationSetNodes[i],
                    adaptationSetElement = createAdaptationSetElement(adaptationSetNode, periodElement);

                adaptationSetElements.push(adaptationSetElement);

                //REPRESENTATION
                var representationNodes = adaptationSetNode.getElementsByTagName("Representation"),
                    representationElements = [];
                for (var j = 0; j < representationNodes.length; j += 1) {
                    var representationNode = representationNodes[j],
                        representationElement = createRepresentationElement(representationNode, adaptationSetElement);

                    var segmentElement = createSegmentElement(representationNode, representationElement, isYouTube);

                    representationElement.setSegment(segmentElement);

                    representationElements.push(representationElement);
                }

                //sort representations and add them order indexes
                representationElements.sort(function (a, b) {
                    return a.getBandwidth() - b.getBandwidth();
                });

                representationElements.forEach(function (element, index) {
                    element.orderNumber = index + 1;
                });

                adaptationSetElement.setRepresentations(representationElements);
            }

            periodElement.setAdaptationSets(adaptationSetElements);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, 'MPD file parsing finished and MPD model successfully created');
            return mpdElement;
        }
    };
};
Dash.streaming.BufferManager = function (sourceBuffer) {
    'use strict';

    var bufferQueue = [],

        updateSourceBuffer = function () {
            if (sourceBuffer.updating) {
                setTimeout(updateSourceBuffer, 200);
            } else {
                var arrayBuffer = bufferQueue.pop();
                sourceBuffer.appendBuffer(arrayBuffer);
            }
        };

    return {
        appendBuffer: function (arrayBuffer) {
            bufferQueue.push(arrayBuffer);
            updateSourceBuffer();
        }
    };
};
Dash.streaming.DefaultInitRepresentationPicker = function () {
    'use strict';

    var chooseInitRepresentationForVideo = function (representations) {
            //try to choose representation with 480p quality at most
            var clonedRepresentations = representations.slice(0),
                chosenRepresentation;

            clonedRepresentations.sort(function (a, b) {
                return a.getHeight() - b.getHeight();
            });

            chosenRepresentation = clonedRepresentations[0];
            for (var i = 1; i < clonedRepresentations.length; i += 1) {
                if (clonedRepresentations[i].getHeight() > 480) {
                    return chosenRepresentation;
                } else {
                    chosenRepresentation = clonedRepresentations[i];
                }
            }
            return chosenRepresentation;
        },

        chooseInitRepresentationForAudio = function (representations) {
            //choose mid representation
            var index = Math.floor(representations.length / 2);
            return representations[index];
        },

        chooseInitRepresentationForText = function (representations) {
            //choose first
            return representations[0];
        };

    return {
        chooseInitRepresentation: function (representations, mediaType) {
            switch (mediaType) {
                case Dash.model.MediaType.VIDEO:
                    return chooseInitRepresentationForVideo(representations);
                case Dash.model.MediaType.AUDIO:
                    return chooseInitRepresentationForAudio(representations);
                case Dash.model.MediaType.TEXT:
                    return chooseInitRepresentationForText(representations);
            }
        }
    };
};
Dash.streaming.PlaybackManager = function (mpdModel, mediaSource, eventBus, adaptationManager, adaptationSetPicker, initRepresentationPicker) {
    'use strict';

    var videoStreamingManager,
        audioStreamingManager,
        textStreamingManager,
        streamingManagers = [],

        alreadyFinishedManagers = 0,

        onAdaptationSetChosen = function (chosenAdaptationSet) {
            var logMessage = 'Adaptation set has been chosen for ' + chosenAdaptationSet.getMediaType().name +
                ', mime type: ' + chosenAdaptationSet.getMimeType() + ' representations count: ' + chosenAdaptationSet.getRepresentations().length;

            eventBus.dispatchEvent({type: Dash.event.Events.ADAPTATION_SET_INITIALIZED, value: chosenAdaptationSet});
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);
        },

        onInitRepresentationChosen = function (chosenRepresentation) {
            var logMessage = 'Init representation has been chosen for ' + chosenRepresentation.getAdaptationSet().getMediaType().name +
                ', number: ' + chosenRepresentation.orderNumber + ', id: ' + chosenRepresentation.getId() + ', bandwidth: ' + chosenRepresentation.getBandwidth();

            eventBus.dispatchEvent({type: Dash.event.Events.REPRESENTATION_INITIALIZED, value: chosenRepresentation});
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);
        },

        appendNextSegmentForStreamingManagers = function () {
            if (streamingManagers.length > 0) {
                var index = streamingManagers.length - 1;
                while (index >= 0) {
                    if (streamingManagers[index].isStreamingFinished()) {
                        eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, 'Streaming for ' + streamingManagers[index].getMediaType().name + ' has finished');
                        streamingManagers = streamingManagers.slice(0, index);
                    } else {
                        streamingManagers[index].appendNextSegment();
                    }
                    index -= 1;
                }
            }
        },

        onInitializationCompleted = function () {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG,
                'Streaming initialization has finished. All initialization headers for representations have been downloaded');
            alreadyFinishedManagers = 0;
            appendNextSegmentForStreamingManagers();
        },

        onInitializationAppended = function () {
            alreadyFinishedManagers += 1;

            if (alreadyFinishedManagers === streamingManagers.length) {
                onInitializationCompleted();
            }
        },

        onSegmentAppendedCompleted = function () {
            alreadyFinishedManagers = 0;
            appendNextSegmentForStreamingManagers();
        },

        onSegmentAppended = function (/*request, loaded, options*/) {
            alreadyFinishedManagers += 1;

            if (alreadyFinishedManagers === streamingManagers.length) {
                onSegmentAppendedCompleted();
            }
        },

        getAdaptationSetForMedia = function (period, mediaType) {
            var adaptationSet = null;

            if (adaptationSetPicker) {
                adaptationSet = adaptationSetPicker.chooseAdaptationSet(period.getAdaptationSets(), Dash.model.MediaType.VIDEO);
            } else {
                if (mediaType === Dash.model.MediaType.VIDEO) {
                    adaptationSet = period.getVideoAdaptationSet(Dash.model.MediaFormat.MP4);
                } else if (mediaType === Dash.model.MediaType.AUDIO) {
                    adaptationSet = period.getAudioAdaptationSet(Dash.model.MediaFormat.MP4);
                } else if (mediaType === Dash.model.MediaType.TEXT) {
                    return;
                } else {
                    throw new Error('Not supported media type');
                }
            }

            onAdaptationSetChosen(adaptationSet);
            return adaptationSet;
        },

        getAdaptationSetForVideo = function (period) {
            return getAdaptationSetForMedia(period, Dash.model.MediaType.VIDEO);
        },

        getAdaptationSetForAudio = function (period) {
            return getAdaptationSetForMedia(period, Dash.model.MediaType.AUDIO);
        },

        getAdaptationSetForText = function (period) {
            return getAdaptationSetForMedia(period, Dash.model.MediaType.TEXT);
        },

        getInitRepresentationForMedia = function (adaptationSet, mediaType) {
            var representation;

            if (initRepresentationPicker) {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Using InitRepresentation for choosing init representation for ' + mediaType.name);
                representation = initRepresentationPicker.chooseInitRepresentation(adaptationSet.getRepresentations(), mediaType);
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG,
                    'InitRepresentaionPicker is not defined, representation with lowest bandwidth will be chosen for ' + mediaType.name);
                representation = adaptationSet.getRepresentations()[0];
            }

            onInitRepresentationChosen(representation);
            return representation;
        },

        createSourceBufferObject = function (adaptationSet, initRepresentation) {
            var mediaSourceInitString =
                Dash.utils.CommonUtils.createSourceBufferInitString(adaptationSet, initRepresentation);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO,
                'Creating source buffer object using init string "' + mediaSourceInitString + '"');
            return mediaSource.addSourceBuffer(mediaSourceInitString);
        },

        initializeStreamingForMediaType = function (adaptationSet, mediaType) {
            eventBus.dispatchEvent(Dash.log.LogLevel.DEBUG, 'Creating streaming manager for ' + mediaType.name);

            var initRepresentation = getInitRepresentationForMedia(adaptationSet, mediaType),
                sourceBuffer = createSourceBufferObject(adaptationSet, initRepresentation);
            return Dash.streaming.StreamingManager(adaptationSet, initRepresentation, sourceBuffer,
                onInitializationAppended, onSegmentAppended, eventBus);
        },

        initializeStreamingManagers = function () {
            var period = mpdModel.getPeriod(),
                videoAdaptationSet = getAdaptationSetForVideo(period),
                audioAdaptationSet = getAdaptationSetForAudio(period),
                textAdaptationSet = getAdaptationSetForText(period);

            if (videoAdaptationSet) {
                videoStreamingManager = initializeStreamingForMediaType(videoAdaptationSet, Dash.model.MediaType.VIDEO);
                streamingManagers.push(videoStreamingManager);
            }

            if (audioAdaptationSet) {
                audioStreamingManager = initializeStreamingForMediaType(audioAdaptationSet, Dash.model.MediaType.AUDIO);
                streamingManagers.push(audioStreamingManager);
            }

            if (textAdaptationSet) {
                textStreamingManager = initializeStreamingForMediaType(textAdaptationSet, Dash.model.MediaType.TEXT);
                streamingManagers.push(textStreamingManager);
            }

            for (var i = 0; i < streamingManagers.length; i += 1) {
                streamingManagers[i].appendInitialization();
            }
        };

    initializeStreamingManagers();

    return {
        changeRepresentationToHigher: function (mediaType, steps) {
            if (mediaType === Dash.model.MediaType.AUDIO && audioStreamingManager) {
                audioStreamingManager.changeRepresentationToHigher(steps);
            } else if (mediaType === Dash.model.MediaType.VIDEO && videoStreamingManager) {
                videoStreamingManager.changeRepresentationToHigher(steps);
            } else if (mediaType === Dash.model.MediaType.TEXT && textStreamingManager) {
                textStreamingManager.changeRepresentationToHigher(steps);
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.WARN, 'Unsupported media type found while changing representation to higher ' + mediaType);
            }
        },

        changeRepresentationToLower: function (mediaType, steps) {
            if (mediaType === Dash.model.MediaType.AUDIO && audioStreamingManager) {
                audioStreamingManager.changeRepresentationToLower(steps);
            } else if (mediaType === Dash.model.MediaType.VIDEO && videoStreamingManager) {
                videoStreamingManager.changeRepresentationToLower(steps);
            } else if (mediaType === Dash.model.MediaType.TEXT && textStreamingManager) {
                textStreamingManager.changeRepresentationToLower(steps);
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.WARN, 'Unsupported media type found while changing representation to lower ' + mediaType);
            }
        },

        changeRepresentation: function (mediaType, representationId) {
            if (mediaType === Dash.model.MediaType.AUDIO && audioStreamingManager) {
                audioStreamingManager.changeRepresentation(representationId);
            } else if (mediaType === Dash.model.MediaType.VIDEO && videoStreamingManager) {
                videoStreamingManager.changeRepresentation(representationId);
            } else if (mediaType === Dash.model.MediaType.TEXT && textStreamingManager) {
                textStreamingManager.changeRepresentation(representationId);
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.WARN, 'Unsupported media type found while changing representation ' + mediaType);
            }
        },

        disableAdaptation: function () {
            eventBus.dispatchEvent(Dash.log.LogLevel.INFO, 'Adaptation has been disabled by user');
            adaptationManager = undefined;
        },

        enableAdaptation: function (adaptationAlgorithmName) {
            //FIXME implement me
            eventBus.dispatchEvent(Dash.log.LogLevel.INFO, 'Adaptation has been enabled using algorithm ' + adaptationAlgorithmName);
            eventBus.dispatchLogEvent(Dash.log.LogLevel.WARN, 'Dynamic adaptation is not supported for now');
            adaptationManager = null;
        }
    };
};
Dash.streaming.RepresentationManager = function (adaptationSet, playbackStatusManager, chooseStartRepresentation) {
    'use strict';

    var availableRepresentations = adaptationSet.getRepresentations(),
        currentRepresentationIndex = chooseStartRepresentation(availableRepresentations);

    playbackStatusManager.fireRepresentationChangedEvent(availableRepresentations[currentRepresentationIndex]);

    return {
        getCurrentRepresentation: function () {
            return availableRepresentations[currentRepresentationIndex];
        },

        isPresentRepresentationHighest: function () {
            return currentRepresentationIndex === availableRepresentations.length - 1;
        },

        switchRepresentationToHigher: function (hopNumber) {
            hopNumber = hopNumber || 1;

            if (currentRepresentationIndex + hopNumber >= availableRepresentations.length) {
                currentRepresentationIndex = availableRepresentations.length - 1;
            } else {
                currentRepresentationIndex = currentRepresentationIndex + hopNumber;
            }

            var currentRepresentation = availableRepresentations[currentRepresentationIndex];
            playbackStatusManager.fireRepresentationChangedEvent(currentRepresentation);
            return currentRepresentation;
        },

        isPresentRepresentationLowest: function () {
            return currentRepresentationIndex === 0;
        },

        switchRepresentationToLower: function (hopNumber) {
            hopNumber = hopNumber || 1;

            if (currentRepresentationIndex - hopNumber < 0) {
                currentRepresentationIndex = 0;
            } else {
                currentRepresentationIndex = currentRepresentationIndex - hopNumber;
            }

            var currentRepresentation = availableRepresentations[currentRepresentationIndex];
            playbackStatusManager.fireRepresentationChangedEvent(currentRepresentation);
            return currentRepresentation;
        }
    };
};

Dash.streaming.RepresentationRepository = function () {
    'use strict';

    var repository = {},
        checkIfRepresentationIsInitialized = function (representationId) {
            if (repository[representationId] === undefined) {
                throw new Error('Representation buffer not initialized for representation - ' + representationId);
            }
        };

    return {
        addRepresentation: function (representation, header, url) {
            var representationId = representation.getId();
            repository[representationId] = {header: header, buffer: [], url: url};
        },

        appendBuffer: function (representation, partId, bufferPart) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            if (repository[representationId].buffer[partId] === undefined) {
                repository[representationId].buffer[partId] = bufferPart;
            }
        },

        isBufferAlreadyDownloaded: function (representation, partId) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].buffer[partId] !== undefined;
        },

        getHeader: function (representation) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].header;
        },

        getHeaderUrl: function (representation) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].url;
        },

        getBuffer: function (representation, partId) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].buffer[partId];
        },

        //only for debug purpose, delete
        getRepository: function () {
            return repository;
        }
    };
};

Dash.streaming.StreamingManager = function (adaptationSet, initRepresentation, sourceBuffer,
                                            initializationCallback, segmentDownloadCallback, eventBus) {
    'use strict';

    var bufferManager = Dash.streaming.BufferManager(sourceBuffer),
        representationRepository = Dash.streaming.RepresentationRepository(),
        asyncDownloader = Dash.utils.AsyncDownloader(),
        currentRepresentation = initRepresentation,
        currentRepresentationIndex = adaptationSet.getIndexOfRepresentation(initRepresentation),
        availableRepresentationSortedByBandwidth = adaptationSet.getRepresentations(),
        lowestRepresentationIndex = 0,
        highestRepresentationIndex = availableRepresentationSortedByBandwidth.length - 1,
        currentInitializationHeader,
        availableSegmentURLs,
        currentSegmentIndex = 0,
        isInitialized = false,
        pendingRepresentationChange = {available: false, index: 0},

        downloadBinaryFile = function (url, onSuccess, onFailure, onProgress) {
            if (typeof url === 'string') {
                asyncDownloader.downloadBinaryFile(url, onSuccess, onFailure, onProgress);
            } else {
                asyncDownloader.downloadBinaryFilePart(url.url, onSuccess, onProgress, onProgress, url.range);
            }
        },

        notifyRepresentationChange = function (changedRepresentation) {
            var logMessage = 'Representation changed for ' + adaptationSet.getMediaType().name +
                ', number: ' + changedRepresentation.orderNumber + ', id: ' + changedRepresentation.getId() +
                ', bandwidth: ' + changedRepresentation.getBandwidth();

            eventBus.dispatchEvent({type: Dash.event.Events.REPRESENTATION_CHANGED, value: currentRepresentation});
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);
        },

        updateValuesAfterChangingRepresentation = function (changedRepresentationIndex) {
            currentRepresentationIndex = changedRepresentationIndex;
            currentRepresentation = availableRepresentationSortedByBandwidth[currentRepresentationIndex];
            currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
            availableSegmentURLs = currentRepresentation.getSegment().getSegmentURLs();

            notifyRepresentationChange(currentRepresentation);
            bufferManager.appendBuffer(currentInitializationHeader);
        },

        notifySuccessfulSegmentDownload = function (requestOptions) {
            var logMessage = 'Segment ' + currentSegmentIndex + '/' + availableSegmentURLs.length +
                ' downloaded for ' + adaptationSet.getMediaType().name + ' url: ' + requestOptions.url;

            eventBus.dispatchEvent(
                {
                    type: Dash.event.Events.SEGMENT_DOWNLOADED,
                    value: {
                        mediaType: adaptationSet.getMediaType(),
                        currentSegment: currentSegmentIndex,
                        maxSegment: availableSegmentURLs.length
                    }
                }
            );
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
        },

        onSegmentDownload = function (request, loaded, options) {
            notifySuccessfulSegmentDownload(options);

            var arrayBuffer = new Uint8Array(request.response);

            bufferManager.appendBuffer(arrayBuffer);
            representationRepository.appendBuffer(currentRepresentation, currentSegmentIndex, arrayBuffer);

            if (pendingRepresentationChange.available && pendingRepresentationChange.index !== currentRepresentationIndex) {
                updateValuesAfterChangingRepresentation(pendingRepresentationChange.index);
                pendingRepresentationChange.available = false;
            }

            segmentDownloadCallback.call(this, request, loaded, options);
        },

        findRepresentationByItsId = function (representationId) {
            for (var i = 0; i < availableRepresentationSortedByBandwidth.length; i += 1) {
                if (availableRepresentationSortedByBandwidth[i].getId() === representationId) {
                    return i;
                }
            }
            return -1;
        },

        changeRepresentationBySteps = function (steps) {
            var changedRepresentationIndex = currentRepresentationIndex + steps;

            if (changedRepresentationIndex < lowestRepresentationIndex) {
                changedRepresentationIndex = 0;
            } else if (changedRepresentationIndex > highestRepresentationIndex) {
                changedRepresentationIndex = highestRepresentationIndex;
            }

            pendingRepresentationChange.available = true;
            pendingRepresentationChange.index = changedRepresentationIndex;
        },

        changeRepresentationByItsId = function (representationId) {
            var representationIndex = findRepresentationByItsId(representationId);
            if (representationIndex === -1) {
                eventBus.logMessage(Dash.log.LogLevel.ERROR,
                    'Cannot changed representation. Representations with index ' + representationId + ' not found');
            } else {
                pendingRepresentationChange.available = true;
                pendingRepresentationChange.index = representationIndex;
            }
        },

        downloadAvailableHeaders = function () {
            var index = -1,
                representation,
                initializationURL,

                moveToNextRepresentation = function () {
                    index += 1;

                    if (index < availableRepresentationSortedByBandwidth.length) {
                        representation = availableRepresentationSortedByBandwidth[index];
                        initializationURL = representation.getSegment().getInitializationURL();
                        return true;
                    } else {
                        return false;
                    }
                },

                onDownloadSuccess = function (request, loaded, options) {
                    var logMessage = 'Initialization header successfully downloaded for ' + adaptationSet.getMediaType().name +
                        ' representation, number: ' + representation.orderNumber + ', id: ' + representation.getId() +
                        ', bandwidth: ' + representation.getBandwidth() + ', url: ' + options.url;

                    eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);

                    var header = new Uint8Array(request.response);
                    representationRepository.addRepresentation(representation, header, options.url);

                    var segment = representation.getSegment();
                    if (segment.name === 'RangeSegment') {
                        segment.computeSegmentRanges(header);
                    }

                    if (moveToNextRepresentation()) {
                        downloadBinaryFile(initializationURL, onDownloadSuccess);
                    } else {
                        isInitialized = true;
                    }
                };

            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Starting downloading headers for all available representations for ' + adaptationSet.getMediaType().name);
            moveToNextRepresentation();
            downloadBinaryFile(initializationURL, onDownloadSuccess);
        };

    downloadAvailableHeaders();

    return {
        getMediaType: function () {
            return adaptationSet.getMediaType();
        },

        appendInitialization: function () {
            var self = this;
            if (!isInitialized) {
                setTimeout(function () {
                    self.appendInitialization();
                }, 500);
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Appending initialization header to source buffer for ' + adaptationSet.getMediaType().name);
                currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
                availableSegmentURLs = currentRepresentation.getSegment().getSegmentURLs();
                bufferManager.appendBuffer(currentInitializationHeader);
                initializationCallback.call(this);
            }
        },

        appendNextSegment: function () {
            if (!this.isStreamingFinished()) {
                var segmentURL = availableSegmentURLs[currentSegmentIndex];
                downloadBinaryFile(segmentURL, onSegmentDownload);
                currentSegmentIndex += 1;
            } else {
                eventBus.logMessage(Dash.log.LogLevel.ERROR,
                    'Cannot append next segment to buffer because its already finished for ' + adaptationSet.getMediaType());
            }
        },

        isStreamingFinished: function () {
            return currentSegmentIndex === availableSegmentURLs.length;
        },

        changeRepresentationToHigher: function (steps) {
            if (!steps || steps < 0) {
                steps = 1;
            }
            changeRepresentationBySteps(steps);
        },

        changeRepresentation: function (representationId) {
            changeRepresentationByItsId(representationId);
        },

        changeRepresentationToLower: function (steps) {
            if (!steps || steps < 0) {
                steps = 1;
            }
            changeRepresentationBySteps(-steps);
        }
    };
};

Dash.utils.AsyncDownloader = function () {
    'use strict';

    var sendHttpGetRequest = function (url, expectedStatusCode, requestOnSuccess, requestOnFailure, requestOnProgress, responseType, range) {
        var request = new XMLHttpRequest(),
            startTime,
            requestDuration;

        expectedStatusCode = expectedStatusCode || 200;

        if (responseType) {
            request.responseType = responseType;
        }

        if (requestOnProgress) {
            request.onprogress = requestOnProgress;
        }

        request.onload = function (event) {
            if (request.status === expectedStatusCode) {
                requestDuration = new Date() - startTime;
                requestOnSuccess(request, event.loaded, {url: url, duration: requestDuration});
            } else {
                requestOnFailure(request);
            }
        };

        startTime = new Date();
        request.open('GET', url, true);
        if (range) {
            request.setRequestHeader('Range', 'bytes=' + range);
        }
        request.send();
    };


    return {
        downloadBinaryFilePart: function (url, requestOnSuccess, requestOnFailure, requestOnProgress, range) {
            sendHttpGetRequest(url, 206, requestOnSuccess, requestOnFailure, requestOnProgress, "arraybuffer", range);
        },

        downloadBinaryFile: function (url, requestOnSuccess, requestOnFailure, requestOnProgress) {
            sendHttpGetRequest(url, 200, requestOnSuccess, requestOnFailure, requestOnProgress, "arraybuffer");
        },

        download: function (url, requestOnSuccess, requestOnFailure, requestOnProgress) {
            sendHttpGetRequest(url, 200, requestOnSuccess, requestOnFailure, requestOnProgress);
        }
    };
};

Dash.utils.CommonUtils = {
    computeDownloadSpeed: function (bytes, miliseconds) {
        'use strict';
        return (bytes * 8) / (miliseconds / 1000); // bits per second
    },

    createSourceBufferInitString: function (adaptationSet, representation) {
        'use strict';
        var codecs;
        if (adaptationSet.getCodecs()) {
            codecs = adaptationSet.getCodecs();
        } else {
            codecs = representation.getCodecs();
        }

        return adaptationSet.getMimeType() + '; codecs="' + codecs + '"';
    },

    escapeRegExp: function (string) {
        'use strict';
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    },

    replaceAll: function (string, find, replace) {
        'use strict';
        return string.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    },

    convertDurationInSecondsToPrettyString: function (durationInSeconds) {
        'use strict';
        var hours = Math.floor(durationInSeconds / 3600),
            minutes = Math.floor(durationInSeconds / 60),
            seconds = Math.floor(durationInSeconds % 60),
            milliSeconds = Math.floor((durationInSeconds % 1) * 100),
            outputString = '',

            fillNumberWithZeros = function (number, isFirst) {
                if (number < 10 && !isFirst) {
                    return '0' + number;
                } else {
                    return number.toString();
                }
            };

        if (hours !== 0) {
            outputString += fillNumberWithZeros(hours, true) + ':';
        }
        if (minutes !== 0) {
            outputString += fillNumberWithZeros(minutes, outputString.length === 0) + ':';
        }
        outputString += fillNumberWithZeros(seconds, outputString.length === 0);

        if (milliSeconds !== 0) {
            outputString += '.' + milliSeconds;
        }

        return outputString;
    }
};

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
            return baseURL + '/' + rawURL;
        }
    },

    findDirectChildrenByTagName: function (node, tagName) {
        'use strict';

        var children = node.children,
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
    }
};
