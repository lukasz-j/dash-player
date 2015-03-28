function MPDDownloader(mpdFileUrl, isYouTubeVideo, downloadMpdFileOnReady) {
    var youTubeDomain = 'http://www.youtube.com',
        getInfoMapping = '/get_video_info?html5=1&video_id=',
        videoIdPrefix = 'v=',
        mpdEntryPrefix = 'dashmpd=',

        downloadYouTubeMpdFile = function () {
            var videoId = getYouTubeVideoId(mpdFileUrl);
            var url = youTubeDomain + getInfoMapping + videoId;
            AsyncDownloader().download(url, downloadYouTubeVideoDetailsOnReady);
        },
        downloadYouTubeVideoDetailsOnReady = function (request) {
            var mpdUrl = getMpdUrlFromResponse(request.responseText);
            AsyncDownloader().download(mpdUrl, downloadMpdFileOnReady);
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
        //TODO: consider worker
        downloadMpdFile: function () {
            if (isYouTubeVideo) {
                downloadYouTubeMpdFile();
            } else {

            }
        }
    }
}
