Dash.Player = function (videoElement, debugInfoElement) {
    'use strict';

    var playbackStatusManager = Dash.utils.PlaybackStatusManager(debugInfoElement),

        initializeStreaming = function (mpdModel) {
            var videoStreamingManager = Dash.streaming.StreamingManager(mpdModel, playbackStatusManager, {
                    mediaType: Dash.model.MediaType.VIDEO,
                    initType: 'quality',
                    value: 360
                }),
                audioStreamingManager = Dash.streaming.StreamingManager(mpdModel, playbackStatusManager, {
                    mediaType: Dash.model.MediaType.AUDIO,
                    initType: 'bandwidth',
                    value: 0
                }),
                videoRepresentationManager = videoStreamingManager.getRepresentationManager(),
                mediaSource,
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
            videoElement.width = videoRepresentationManager.getCurrentRepresentation().getWidth();
            videoElement.height = videoRepresentationManager.getCurrentRepresentation().getHeight();

            mediaSource.addEventListener('sourceopen', function () {
                videoStreamingManager.initializeStreaming(mediaSource);
                audioStreamingManager.initializeStreaming(mediaSource);

                videoStreamingManager.startStreaming();
                audioStreamingManager.startStreaming();
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

        play: function (playingMode) {
            if (typeof mpdModel === 'undefined') {
                console.log('MPD is not loaded');
            } else {
            }
        }
    };
};
