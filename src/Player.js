Dash.Player = function ($window, eventBus) {
    'use strict';

    var playbackManager,
        adaptationSetPicker,
        initRepresentationPicker,
        videoElement,

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
                playbackManager = Dash.streaming.PlaybackManager(mpdModel, mediaSource, videoElement, eventBus, adaptationManager,
                    initRepresentationPicker);
                adaptationManager.setPlaybackManager(playbackManager);
            adaptationManager.initStatsCollector(videoElement, mediaSource);
                playbackManager.setBufferingThreshold(10); // debug
            }, false);
            adaptationManager.initConditonsHolder();
        },

        onSuccessMpdDownloadCallback = function (request, options) {
            var mpdModel = Dash.mpd.Parser(eventBus).generateModel(request.responseText, options.url, options.isYouTube);

            if (typeof mpdModel === 'undefined') {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.ERROR, 'Model generated from mpd file is empty, cannot continue');
            } else {
                eventBus.dispatchEvent({type: Dash.event.Events.MPD_LOADED, value: mpdModel});
                initializeStreaming(mpdModel);
            }
        },
        adaptationManager = Dash.adaptation.AdaptationManager();

    return {
        adaptationManager: adaptationManager,

        setVideoElement: function(element) {
            // dynamically set <video> element to render in after rendering it
            videoElement = element;
        },

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
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received disable adaptation request');
            adaptationManager.disableAdaptation();
        },

        enableAdaptation: function (adaptationAlgorithmName) {
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Received enabling adaptation request, using enabling adaptation engine');
            adaptationManager.enableAdaptation();
        },

        setBufferingThreshold: function(seconds) {
            if (seconds >= 0) {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Buffering threshold set to ' + seconds + ' seconds');
            }
            else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Buffering threshold disabled');
            }
            playbackManager.setBufferingThreshold(seconds);
        }
    };
};
