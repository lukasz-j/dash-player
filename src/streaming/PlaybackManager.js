Dash.streaming.PlaybackManager = function (mpdModel, mediaSource, eventBus, adaptationManager, chooseAdaptationSet, chooseInitRepresentation) {
    'use strict';

    var videoStreamingManager,
        audioStreamingManager,
        textStreamingManager,
        streamingManagers = [],

        alreadyFinishedManagers = 0,

        appendNextSegmentForStreamingManagers = function () {
            if (streamingManagers.length > 0) {
                var index = streamingManagers.length - 1;
                while (index >= 0) {
                    if (streamingManagers[index].isStreamingFinished()) {
                        streamingManagers = streamingManagers.slice(0, index);
                    } else {
                        streamingManagers[index].appendNextSegment();
                    }
                    index -= 1;
                }
            }
        },

        onInitializationCompleted = function () {
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

        onSegmentAppended = function (request, loaded, options) {
            alreadyFinishedManagers += 1;

            if (alreadyFinishedManagers === streamingManagers.length) {
                onSegmentAppendedCompleted();
            }
        },

        getAdaptationSetForMedia = function (period, mediaType) {
            var adaptationSet = null;

            if (chooseAdaptationSet) {
                adaptationSet = chooseAdaptationSet(period.getAdaptationSets(), Dash.model.MediaType.VIDEO);
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

            eventBus.dispatchEvent({type: Dash.event.Events.ADAPTATION_SET_INITIALIZED, value: adaptationSet});
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

            if (chooseInitRepresentation) {
                representation = chooseInitRepresentation(adaptationSet.getRepresentations(), mediaType);
            } else {
                representation = adaptationSet.getRepresentations()[0];
            }

            eventBus.dispatchEvent({type: Dash.event.Events.REPRESENTATION_INITIALIZED, value: representation});
            return representation;
        },

        getInitRepresentationForVideo = function (adaptationSet) {
            return getInitRepresentationForMedia(adaptationSet, Dash.model.MediaType.VIDEO);
        },

        getInitRepresentationForAudio = function (adaptationSet) {
            return getInitRepresentationForMedia(adaptationSet, Dash.model.MediaType.AUDIO);
        },

        getInitRepresentationForText = function (adaptationSet) {
            return getInitRepresentationForMedia(adaptationSet, Dash.model.MediaType.TEXT);
        },

        createSourceBufferObject = function (adaptationSet, initRepresentation) {
            var mediaSourceInitString =
                Dash.utils.CommonUtils.createSourceBufferInitString(adaptationSet, initRepresentation);
            return mediaSource.addSourceBuffer(mediaSourceInitString);
        },

        initializeStreamingForMediaType = function (adaptationSet, mediaType) {
            var initRepresentation = getInitRepresentationForMedia(adaptationSet, mediaType),
                sourceBuffer = createSourceBufferObject(adaptationSet, initRepresentation);
            return Dash.streaming.StreamingManager(adaptationSet, initRepresentation, sourceBuffer,
                onInitializationAppended, onSegmentAppended, eventBus);
        },

        getStreamingManagerForMediaType = function (mediaType) {
            if (mediaType === Dash.model.MediaType.AUDIO && audioStreamingManager) {
                audioStreamingManager.changeRepresentationToHigher(steps);
            } else if (mediaType === Dash.model.MediaType.VIDEO && videoStreamingManager) {
                videoStreamingManager.changeRepresentationToHigher(steps);
            } else if (mediaType === Dash.model.MediaType.TEXT && textStreamingManager) {
                textStreamingManager.changeRepresentationToHigher(steps);
            } else {
                console.warn('Unsupported media type found while changing representation to higher - ' + mediaType);
            }
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
                console.warn('Unsupported media type found while changing representation to higher - ' + mediaType);
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
                console.warn('Unsupported media type found while changing representation to lower - ' + mediaType);
            }
        },

        disableAdaptation: function () {
            adaptationManager = undefined;
        },

        enableAdaptation: function (adaptationAlgorithmName) {
            //FIXME implement me
            adaptationManager = null;
        }
    };
};