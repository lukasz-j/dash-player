var MPDDownloader = function (mpdFileUrl, isYouTubeVideo) {
    var youTubeDomain = 'http://www.youtube.com',
        getInfoMapping = '/get_video_info?html5=1&video_id=',
        videoIdPrefix = 'v=',
        mpdEntryPrefix = 'dashmpd=',


        downloadMpdFile = function (url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send(null);

            return request.responseText;
        },

        downloadYouTubeMpdFile = function () {
            var videoId = getYouTubeVideoId(mpdFileUrl);
            var videoDetails = downloadYouTubeVideoDetails(videoId);
            var mpdUrl = getMpdUrlFromResponse(videoDetails);

            return downloadMpdFile(mpdUrl);
        },

        getYouTubeVideoId = function (videoUrl) {
            var urlParameters = videoUrl.split('?');
            for (var i = 0; i < urlParameters.length; i += 1) {
                if (urlParameters[i].indexOf(videoIdPrefix) === 0) {
                    return urlParameters[i].substring(videoIdPrefix.length)
                }
            }
        },

        downloadYouTubeVideoDetails = function (videoId) {
            var url = youTubeDomain + getInfoMapping + videoId,
                request = new XMLHttpRequest();

            request.open('GET', url, false);
            request.send(null);

            if (request.status === 200) {
                return request.responseText;
            } else {
                throw new Error('Error while obtaining YouTube movie details from url ' + url + ', error code: ' + request.status);
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
        //TODO: consider asynchronous mpd file download (or worker?)
        downloadMpdFile: function () {
            var mpdFileContent = null;
            if (isYouTubeVideo) {
                mpdFileContent = downloadYouTubeMpdFile();
            } else {
                mpdFileContent = downloadMpdFile();
            }
            console.log(mpdFileContent);
            return mpdFileContent;
        }
    }
};

MPDDownloader('https://www.youtube.com/watch?v=_J1m3oOqtqc', true).downloadMpdFile();