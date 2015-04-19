Dash.player = function (videoElement, detailsElement) {
    var mpdModel,
        mediaSource,
        streamingManager,
        representationManager;

    var onSuccessMpdDownloadCallback = function (request, loadedBytes, requestDuration) {
            var downloadSpeed = (loadedBytes / 1024) / (requestDuration / 1000);
            console.log('Mpd file downloaded: ' + downloadSpeed + "kB/s");
            mpdModel = Dash.mpd.Parser(request.responseText).generateModel();

            if (typeof mpdModel === 'undefined') {
                console.log('MPD is not loaded');
            } else {
                initializeStreaming();
            }
        },

        initializeStreaming = function () {
            streamingManager = Dash.utils.StreamingManager(mpdModel, {type: 'quality', height: 360});
            representationManager = streamingManager.getRepresentationManager();

            if (window.MediaSource) {
                mediaSource = new window.MediaSource();
            } else {
                console.log("MediaSource is not available");
                return;
            }

            var url = URL.createObjectURL(mediaSource);

            videoElement.pause();
            videoElement.src = url;
            videoElement.width = representationManager.getCurrentRepresentation().getWidth();
            videoElement.height = representationManager.getCurrentRepresentation().getHeight();

            streamingManager.startStreaming(mediaSource);
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
    }
};
