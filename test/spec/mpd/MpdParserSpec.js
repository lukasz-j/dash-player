describe("Parser", function () {
    var resourcesLocation = 'http://localhost:9876/base/test/resources/mpd/',
        eventBus,
        parser;

    beforeEach(function () {
        eventBus = Dash.event.EventBus();
        parser = Dash.mpd.Parser(eventBus);
    });

    describe('parsing youtube_full.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'youtube_full.mpd';

        beforeEach(function (done) {
            $.ajax({
                url: mpdFileURL,
                contentType: 'text/xml'
            }).done(function (data) {
                mpdFileContent = data;
                done();
            });
        });

        it('should return valid model', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, false);
            expect(mpdModel).toBeDefined();

            var period = mpdModel.getPeriod();
            expect(period).toBeDefined();

            var videoAdaptationSets = period.getVideoAdaptationSets(),
                audioAdaptationSets = period.getAudioAdaptationSets();

            expect(videoAdaptationSets.length).toBe(2);
            expect(audioAdaptationSets.length).toBe(2);

            var videoRepresentations = period.getVideoAdaptationSet(Dash.model.MediaFormat.MP4),
                audioRepresentation = period.getAudioAdaptationSet(Dash.model.MediaFormat.MP4);

            expect(videoRepresentations.getRepresentations().length).toBe(6);
            expect(audioRepresentation.getRepresentations().length).toBe(2);

            done();
        });
    });

    describe('parsing youtube youtube_audio_trim.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'youtube_audio_trim.mpd';

        beforeEach(function (done) {
            $.ajax({
                url: mpdFileURL,
                contentType: 'text/xml'
            }).done(function (data) {
                mpdFileContent = data;
                done();
            });
        });

        it('should return valid model', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
            var audioAdaptationSet = mpdModel.getPeriod().getAudioAdaptationSets()[0];

            expect(audioAdaptationSet.getMimeType()).toBe('audio/mp4');

            var audioRepresentation = audioAdaptationSet.getRepresentations()[0];
            expect(audioRepresentation.getId()).toBe('140');
            expect(audioRepresentation.getCodecs()).toBe('mp4a.40.2');
            expect(audioRepresentation.getAudioSamplingRate()).toBe(44100);
            expect(audioRepresentation.getBandwidth()).toBe(129549);
            //expect(audioRepresentation.getSegment().getInitializationURL()).toBe('http://r6---sn-4g57kney.googlevideo.com/videoplayback?id=fc9d66de83aab6a7&range=0-1043');

            done();
        });
    });

    describe('parsing youtube youtube_video_trim.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'youtube_video_trim.mpd';

        beforeEach(function (done) {
            $.ajax({
                url: mpdFileURL,
                contentType: 'text/xml'
            }).done(function (data) {
                mpdFileContent = data;
                done();
            });
        });

        it('should return valid model', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
            var videoAdaptationSet = mpdModel.getPeriod().getVideoAdaptationSets()[0];

            expect(videoAdaptationSet.getMimeType()).toBe('video/mp4');

            var videoRepresentation = videoAdaptationSet.getRepresentations()[0];
            expect(videoRepresentation.getId()).toBe('137');
            expect(videoRepresentation.getHeight()).toBe(1080);
            expect(videoRepresentation.getBandwidth()).toBe(4235268);
            expect(videoRepresentation.getFrameRate()).toBe(25);
            // expect(videoRepresentation.getSegment().getInitializationURL()).toBe('http://r6---sn-4g57kney.googlevideo.com/videoplayback?id=fc9d66de83aab6a7&range=0-1043');

            done();
        });
    });

});