Dash.mpd.Downloader = function (mpdFileUrl, isYouTubeVideo, downloadMpdFileOnSuccess) {
    var youTubeDomain = 'http://www.youtube.com',
        getInfoMapping = '/get_video_info?html5=1&video_id=',
        videoIdPrefix = 'v=',
        mpdEntryPrefix = 'dashmpd=',

        downloadMpdFileFromURL = function () {
            AsyncDownloader().download(mpdFileUrl, downloadMpdFileOnSuccess);
        },

        downloadYouTubeMpdFile = function () {
            var videoId = getYouTubeVideoId(mpdFileUrl);
            var url = youTubeDomain + getInfoMapping + videoId;
            AsyncDownloader().download(url, downloadYouTubeVideoDetailsOnSuccess);
        },

        downloadYouTubeVideoDetailsOnSuccess = function (request) {
            var mpdUrl = getMpdUrlFromResponse(request.responseText);
            AsyncDownloader().download(mpdUrl, downloadMpdFileOnSuccess);
        },

        getYouTubeVideoId = function (videoUrl) {
            var urlParameters = videoUrl.split('?');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(videoIdPrefix) === 0) {
                    return urlParameters[i].substring(videoIdPrefix.length)
                }
            }
        },

        getMpdUrlFromResponse = function (movieDetails) {
            var urlParameters = movieDetails.split('&');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(mpdEntryPrefix) === 0) {
                    return decodeURIComponent(urlParameters[i].substring(mpdEntryPrefix.length));
                }
            }
        };

    return {
        downloadMpdFile: function () {
            if (isYouTubeVideo) {
                downloadYouTubeMpdFile();
            } else {
                downloadMpdFileFromURL();
            }
        }
    }
};
