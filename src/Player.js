Dash.player = function (videoElement, detailsElement) {
    var mpdModel;

    var onSuccessMpdDownloadCallback = function (request, loadedBytes, requestDuration) {
        var downloadSpeed = (loadedBytes / 1024) / (requestDuration / 1000);
        console.log('Mpd file downloaded: ' + downloadSpeed + "kB/s");
        mpdModel = Dash.mpd.Parser(request.responseText).generateModel();

        if (typeof mpdModel === 'undefined') {
            console.log('MPD is not loaded');
        } else {
            var streamingManager = Dash.utils.StreamingManager(mpdModel, {type: 'quality', width: 360});
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
                var streamingManager = Dash.utils.StreamingManager(mpdModel, playingMode);
            }
        }
    }
};
