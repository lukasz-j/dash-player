Dash.player = function (videoElement, detailsElement) {

    var initializeStreaming = function (mpdModel) {
            var streamingManager = Dash.streaming.StreamingManager(mpdModel, {type: 'quality', height: 360}),
                representationManager = streamingManager.getRepresentationManager(),
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
            videoElement.width = representationManager.getCurrentRepresentation().getWidth();
            videoElement.height = representationManager.getCurrentRepresentation().getHeight();

            streamingManager.startStreaming(mediaSource);
        },

        onSuccessMpdDownloadCallback = function (request, loadedBytes, requestDuration) {
            var downloadSpeed = (loadedBytes / 1024) / (requestDuration / 1000),
                mpdModel = Dash.mpd.Parser(request.responseText).generateModel();
            console.log('Mpd file downloaded: ' + downloadSpeed + "kB/s");

            if (typeof mpdModel === 'undefined') {
                console.log('MPD is not loaded');
            } else {
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
