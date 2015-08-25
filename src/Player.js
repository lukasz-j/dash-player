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
