var Player = function (video, audio, bitRate) { //TODO: bitRate will be calculated during downloading segments
    var addSource = function (mediaElement, src, type) {
        var source = document.createElement('source');
        source.src = src;
        source.type = type;
        mediaElement.appendChild(source);
    };

    var videoPausePlayHandler = function (event) {
        if (event.type == 'play') {
            audio.play();
        } else if (event.type == 'pause') {
            audio.pause();
        }
    };

    var videoSeekHandler = function () {
        audio.currentTime = this.currentTime;
    };

    var downloadMpdFileOnReady = function (request) {
        var representationRepo = new RepresentationRepository(request.responseText);
        //var length = representationRepo.getVideoLength();
        //console.log("length = " + length);
        var videoRepresentation = representationRepo.getVideoForBitRate(bitRate * 0.9);
        //console.log("video: bitRate = " + bitRate * 0.9 + ", video bandwidth = " + videoRepresentation.bandwidth);
        console.log("video url: " + videoRepresentation.baseUrl);
        var audioRepresentation = representationRepo.getAudioForBitRate(bitRate * 0.1);
        //console.log("audio: bitRate = " + bitRate * 0.1 + ", audio bandwidth = " + audioRepresentation.bandwidth);
        //console.log("audio url: " + audioRepresentation.baseUrl);
        //downloadMedia(videoRepresentation, audioRepresentation);
    };

    var downloadMedia = function (videoUrl, audioUrl) {
        addSource(video, videoUrl.baseUrl, "video/mp4");
        addSource(audio, audioUrl.baseUrl, "audio/mp4");

        video.addEventListener('play', videoPausePlayHandler, false);
        video.addEventListener('pause', videoPausePlayHandler, false);

        video.addEventListener('seeking', videoSeekHandler, false);
        video.addEventListener('seeked', videoSeekHandler, false);
    };

    return {
        play: function (youtubeUrl) {
            new MPDDownloader(youtubeUrl, true, downloadMpdFileOnReady).downloadMpdFile();
        }
    }
};
