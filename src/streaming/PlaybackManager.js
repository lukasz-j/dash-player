Dash.streaming.PlaybackManager = function (mpdModel, mediaSource, videoElement, eventBus, adaptationManager, initRepresentationPicker) {
    'use strict';

    var videoStreamingManager,
        audioStreamingManager,
        textStreamingManager,
        streamingManagers = [],

        alreadyFinishedManagers = 0,
        bufferingThreshold = 0,

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

        controlFreezing = function(streamingManager) {
            if (bufferingThreshold > 0 && streamingManager.getBufferedPlaybackLength(videoElement) > bufferingThreshold) {
                streamingManager.setFrozen(true);
            }
            else if (streamingManager.isFrozen() && (bufferingThreshold <= 0 || streamingManager.getBufferedPlaybackLength(videoElement) < bufferingThreshold)) {
                streamingManager.setFrozen(false);
            }
            return streamingManager.isFrozen();
        },

        appendNextSegmentForStreamingManagers = function () {
            alreadyFinishedManagers = 0;
            if (streamingManagers.length > 0) {
                var anyoneFrozen = false;
                var running = false;
                var index = streamingManagers.length - 1;
                while (index >= 0) {
                    var frozen = controlFreezing(streamingManagers[index]);
                    if (streamingManagers[index].isStreamingFinished()) {
                        eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, 'Streaming for ' + streamingManagers[index].getMediaType().name + ' has finished');
                        streamingManagers = streamingManagers.splice(index, 1);
                    } else {
                        if (!frozen) {
                            streamingManagers[index].appendNextSegment();
                            running = true;
                        }
                        else {
                            anyoneFrozen = true;
                            alreadyFinishedManagers++; // for this run, frozen manager is like finished
                        }
                    }
                    index -= 1;
                }
                // when not waiting for any streaming manager, schedule re-check
                if (anyoneFrozen && !running) {
                    eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG,
                        'All streaming managers are frozen right now. Waiting.');

                    setTimeout(appendNextSegmentForStreamingManagers, 1000);
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
//                setTimeout(appendNextSegmentForStreamingManagers, 20000);
            appendNextSegmentForStreamingManagers();
        },

        onSegmentAppended = function (/*request, options*/) {
            alreadyFinishedManagers += 1;

            if (alreadyFinishedManagers === streamingManagers.length) {
                onSegmentAppendedCompleted();
            }
        },

        getAdaptationSetForMedia = function (period, mediaType) {
            var adaptationSet = null;

            if (mediaType === Dash.model.MediaType.VIDEO) {
                adaptationSet = period.getVideoAdaptationSet(Dash.model.MediaFormat.MP4);
            } else if (mediaType === Dash.model.MediaType.AUDIO) {
                adaptationSet = period.getAudioAdaptationSet(Dash.model.MediaFormat.MP4);
            } else if (mediaType === Dash.model.MediaType.TEXT) {
                return;
            } else {
                throw new Error('Not supported media type');
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
        },

        setBufferingThreshold: function(seconds) {
            bufferingThreshold = seconds;
        },


        getBufferedPlaybackTime: function (mediaType) {
            if (mediaType === Dash.model.MediaType.AUDIO && audioStreamingManager) {
                return audioStreamingManager.getBufferedPlaybackLength(videoElement);
            } else if (mediaType === Dash.model.MediaType.VIDEO && videoStreamingManager) {
                return videoStreamingManager.getBufferedPlaybackLength(videoElement);
            }
            eventBus.dispatchLogEvent(Dash.log.LogLevel.WARN, 'Unsupported media type found while changing representation to lower ' + mediaType);
            return 0;
        },
    };
};
