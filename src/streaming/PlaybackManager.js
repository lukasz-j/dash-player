Dash.streaming.PlaybackManager = function (mpdModel, mediaSource, adaptationManager, chooseAdaptationSet, chooseInitRepresentation) {


    var videoStreamingManager,
        audioStreamingManager,
        textStreamingManager,
        adaptationManager,
        streamingManagers = [],

        alreadyFinishedManagers = 0,

        processDownload = function () {
            if (streamingManagers.length > 0) {
                var index = streamingManagers.length - 1;
                while (index >= 0) {
                    if (streamingManagers[index].isStreamingFinished()) {
                        streamingManagers = streamingManagers.slice(index, 1);
                    } else {
                        streamingManagers[index].appendNextSegment();
                    }
                    index -= 1;
                }
            }
        },

        onInitializationAppended = function () {
            alreadyFinishedManagers += 1;

            if (alreadyFinishedManagers === streamingManagers.length) {
                onInitializationCompleted();
            }
        },

        onInitializationCompleted = function () {
            alreadyFinishedManagers = 0;
        },

        onSegmentAppended = function (request, loaded, options) {
            alreadyFinishedManagers += 1;

            if (alreadyFinishedManagers === streamingManagers.length) {
                onSegmentAppendedCompleted();
            }
        },

        onSegmentAppendedCompleted = function () {
            alreadyFinishedManagers = 0;
            processDownload();
        },

        getAdaptationSetForVideo = function (period) {
            if (chooseAdaptationSet) {
                return chooseAdaptationSet(period.getAdaptationSets(), Dash.model.MediaType.VIDEO);
            } else {
                return period.getVideoAdaptationSet(Dash.model.MediaFormat.MP4);
            }
        },

        getAdaptationSetForAudio = function (period) {
            if (chooseAdaptationSet) {
                return chooseAdaptationSet(period.getAdaptationSets(), Dash.model.MediaType.AUDIO);
            } else {
                return period.getAudioAdaptationSet(Dash.model.MediaFormat.MP4);
            }
        },

        getInitRepresentationForVideo = function (adaptationSet) {
            if (chooseInitRepresentation) {
                return chooseInitRepresentation(adaptationSet.getRepresentations(), Dash.model.MediaType.VIDEO);
            } else {
                return adaptationSet.getRepresentations()[0];
            }
        },

        getInitRepresentationForAudio = function (adaptationSet) {
            if (chooseInitRepresentation) {
                return chooseInitRepresentation(adaptationSet.getRepresentations(), Dash.model.MediaType.AUDIO);
            } else {
                return adaptationSet.getRepresentations()[0];
            }
        },

        createSourceBufferObject = function (adaptationSet, initRepresentation) {
            var mediaSourceInitString =
                Dash.utils.CommonUtils.createSourceBufferInitString(adaptationSet, initRepresentation);
            return mediaSource.addSourceBuffer(mediaSourceInitString);
        },

        initializeStreamingManagers = function () {
            var period = mpdModel.getPeriod(),
                videoAdaptationSet = getAdaptationSetForVideo(period),
                audioAdaptationSet = getAdaptationSetForAudio(period);

            if (videoAdaptationSet) {
                var videoInitRepresentation = getInitRepresentationForVideo(videoAdaptationSet),
                    videoSourceBuffer = createSourceBufferObject(videoAdaptationSet, videoInitRepresentation);
                videoStreamingManager = Dash.streaming.StreamingManager(videoAdaptationSet, videoInitRepresentation,
                    videoSourceBuffer, onInitializationAppended, onSegmentAppended);
                streamingManagers.push(videoStreamingManager);
            }

            if (audioAdaptationSet) {
                var audioInitRepresentation = getInitRepresentationForAudio(audioAdaptationSet),
                    audioSourceBuffer = createSourceBufferObject(audioAdaptationSet, audioInitRepresentation);
                audioStreamingManager = Dash.streaming.StreamingManager(audioAdaptationSet, audioInitRepresentation,
                    audioSourceBuffer, onInitializationAppended, onSegmentAppended);
                streamingManagers.push(audioStreamingManager);
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
                throw new Error();
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
                throw new Error();
            }
        },

        disableAdaptation: function () {
            adaptationManager = undefined;
        },

        setAdaptationAlgorithm: function ($adaptationManager) {
            adaptationManager = $adaptationManager;
        }
    };
};