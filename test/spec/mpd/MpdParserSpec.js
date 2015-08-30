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

        it('should return valid model for youtube mpd', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
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

    describe('parsing youtube youtube_trim.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'youtube_trim.mpd';

        beforeEach(function (done) {
            $.ajax({
                url: mpdFileURL,
                contentType: 'text/xml'
            }).done(function (data) {
                mpdFileContent = data;
                done();
            });
        });

        it('should create proper range segment for audio', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
            var audioAdaptationSet = mpdModel.getPeriod().getAudioAdaptationSets()[0];

            expect(audioAdaptationSet.getMimeType()).toBe('audio/mp4');

            var audioRepresentation = audioAdaptationSet.getRepresentations()[0];
            expect(audioRepresentation.getId()).toBe('140');
            expect(audioRepresentation.getCodecs()).toBe('mp4a.40.2');
            expect(audioRepresentation.getAudioSamplingRate()).toBe(44100);
            expect(audioRepresentation.getBandwidth()).toBe(129549);
            expect(audioRepresentation.getSegment().getInitializationURL()).toBe('http://r6---sn-4g57kney.googlevideo.com/videoplayback?id=fc9d66de83aab6a7&itag=140&source=youtube&range=0-1043');

            done();
        });

        it('should create proper range segment for video', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
            var videoAdaptationSet = mpdModel.getPeriod().getVideoAdaptationSets()[0];

            expect(videoAdaptationSet.getMimeType()).toBe('video/mp4');

            var videoRepresentation = videoAdaptationSet.getRepresentations()[0];
            expect(videoRepresentation.getId()).toBe('137');
            expect(videoRepresentation.getHeight()).toBe(1080);
            expect(videoRepresentation.getBandwidth()).toBe(4235268);
            expect(videoRepresentation.getFrameRate()).toBe(25);
            expect(videoRepresentation.getSegment().getInitializationURL()).toBe('http://r6---sn-4g57kney.googlevideo.com/videoplayback?id=fc9d66de83aab6a7&range=0-1512');

            done();
        });
    });

    describe('parsing counter_video_list.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'counter_video_list.mpd';

        beforeEach(function (done) {
            $.ajax({
                url: mpdFileURL,
                contentType: 'text/xml'
            }).done(function (data) {
                mpdFileContent = data;
                done();
            });
        });

        it('should create proper list segment for video', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
            expect(mpdModel.getMediaPresentationDuration()).toBe(600);
            var videoAdaptationSet = mpdModel.getPeriod().getVideoAdaptationSets()[0];

            expect(videoAdaptationSet.getMimeType()).toBe('video/mp4');

            var videoRepresentation = videoAdaptationSet.getRepresentations()[0];
            expect(videoRepresentation.getId()).toBe('h264bl_hd');
            expect(videoRepresentation.getHeight()).toBe(720);
            expect(videoRepresentation.getBandwidth()).toBe(514828);
            expect(videoRepresentation.getFrameRate()).toBe(25);

            var listSegment = videoRepresentation.getSegment();
            expect(listSegment.getSegmentURLs().length).toBe(60);
            expect(listSegment.getInitializationURL()).toBe('http://localhost:9876/base/test/resources/mpd/mp4-main-multi-h264bl_hd-.mp4');

            done();
        });
    });

    describe('parsing elephant_template.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'elephant_template.mpd';

        beforeEach(function (done) {
            $.ajax({
                url: mpdFileURL,
                contentType: 'text/xml'
            }).done(function (data) {
                mpdFileContent = data;
                done();
            });
        });

        it('should create proper template segment for audio', function (done) {
            var mpdModel = parser.generateModel(mpdFileContent, mpdFileURL, true);
            expect(mpdModel.getMinBufferTime()).toBe(1.50);

            var audioAdaptationSet = mpdModel.getPeriod().getAdaptationSet(Dash.model.MediaType.AUDIO, Dash.model.MediaFormat.MP4);
            var videoAdaptationSet = mpdModel.getPeriod().getAdaptationSet(Dash.model.MediaType.VIDEO, Dash.model.MediaFormat.MP4);

            expect(audioAdaptationSet).toBeDefined();
            expect(videoAdaptationSet).not.toBeDefined();

            expect(audioAdaptationSet.getMimeType()).toBe('audio/mp4');

            var audioRepresentation = audioAdaptationSet.getRepresentations()[0];
            expect(audioRepresentation.getId()).toBe('4');
            expect(audioRepresentation.getCodecs()).toBe('mp4a.40.29');
            expect(audioRepresentation.getAudioSamplingRate()).toBe(48000);
            expect(audioRepresentation.getBandwidth()).toBe(33432);

            var templateSegment = audioRepresentation.getSegment();
            expect(templateSegment.getTemplateURL()).toBe('ED_MPEG2_32k_$Time$.mp4');
            expect(templateSegment.getSegmentURLs().length).toBe(334);
            expect(templateSegment.getInitializationURL()).toBe('http://localhost:9876/base/test/resources/mpd/ED_MPEG2_32k_init.mp4');
            done();
        });
    });

});