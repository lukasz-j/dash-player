Dash.Player = function (videoElement, debugInfoElement) {
    'use strict';

    var playbackStatusManager = Dash.utils.PlaybackStatusManager(debugInfoElement),
        playbackManager,

        initializeStreaming = function (mpdModel) {
            var mediaSource,
                url;

            if (window.MediaSource) {
                mediaSource = new window.MediaSource();
            } else {
                console.log("MediaSource is not available");
                return;
            }

            url = URL.createObjectURL(mediaSource);

            videoElement.pause();
            videoElement.src = url;

            mediaSource.addEventListener('sourceopen', function () {
                playbackManager = Dash.streaming.PlaybackManager(mpdModel, mediaSource);
            }, false);
        },

        onSuccessMpdDownloadCallback = function (request, loadedBytes, options) {
            var mpdModel = Dash.mpd.Parser(request.responseText, options.url, options.isYouTube).generateModel();

            if (typeof mpdModel === 'undefined') {
                console.log('MPD is not loaded');
            } else {
                playbackStatusManager.fireMpdFileLoadedEvent(mpdModel);
                initializeStreaming(mpdModel);
            }
        };

    return {
        load: function (url, isYouTube) {
            Dash.mpd.Downloader(url, isYouTube, onSuccessMpdDownloadCallback).downloadMpdFile();
        },

        changeRepresentationToHigher: function (mediaType, steps) {
            playbackManager.changeRepresentationToHigher(mediaType, steps);
        },

        changeRepresentationToLower: function (mediaType, steps) {
            playbackManager.changeRepresentationToLower(mediaType, steps);
        },

        enableAdaptation: function (adaptationManager) {
            playbackManager.enableAdaptation(adaptationManager);
        },

        disableAdaptation: function () {
            playbackManager.disableAdaptation();
        }

    };
};
