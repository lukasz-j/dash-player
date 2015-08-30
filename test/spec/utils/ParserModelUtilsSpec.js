describe('ParserModelUtils', function () {
    var parserModelUtils = Dash.utils.ParserModelUtils;

    describe('parsing XML format date', function () {

        var convertXMLDuration = parserModelUtils.convertXMLDurationFormat;

        it('should return proper value for valid format', function () {
            var inputs = [
                {input: 'PT0H10M54.00S', expected: 654},
                {input: 'PT12.30S', expected: 12.30},
                {input: 'PT3H10S', expected: 10810}
            ];

            inputs.forEach(function (element) {
                expect(convertXMLDuration(element.input)).toBe(element.expected);
            });
        });

        it('should throw error for invalid format', function () {
            var inputs = [
                '2M10.0S', 'string'
            ];

            inputs.forEach(function (element) {
                expect(function () {
                    return convertXMLDuration(element);
                }).toThrow();
            });
        });
    });

    it('should replace all ampersands in url', function () {
        var url = 'http://r6---sn-4g57kney.googlevideo.com/videoplayback?id=fc9d66de83aab6a7&amp;itag=136&amp;' +
                'source=youtube&amp;mm=31&amp;pl=17&amp;mv=m&amp;nh=IgpwcjAxLmZyYTA1KgkxMjcuMC4wLjE&amp;ms=au&amp;ratebypass=yes&amp;mime=video/mp4',
            expectedUrl = 'http://r6---sn-4g57kney.googlevideo.com/videoplayback?id=fc9d66de83aab6a7&itag=136&source=youtube&mm=31&pl=17&mv=m' +
                '&nh=IgpwcjAxLmZyYTA1KgkxMjcuMC4wLjE&ms=au&ratebypass=yes&mime=video/mp4';

        expect(parserModelUtils.replaceAmpersandsInURL(url)).toBe(expectedUrl);
    });

    describe('processing segment base', function () {
        var binaryFileURL = 'http://localhost:9876/base/test/resources/binary-files/audio_init.mp4',
            segmentBaseStart = 592,
            segmentBaseEnd = 719,
            initializationHeader;

        beforeEach(function (done) {
            //fixme replace AsyncDownloader with plain ajax
            Dash.utils.AsyncDownloader().downloadBinaryFile(binaryFileURL, function (request) {
                initializationHeader = new Uint8Array(request.response);
                done();
            });
        });

        it('should find segment ranges', function (done) {
            var segmentRanges = parserModelUtils.findSegmentRangedInBaseSegment(initializationHeader, segmentBaseStart, segmentBaseEnd);

            expect(segmentRanges.length).toBe(8);

            expect(segmentRanges[0].begin).toBe(720);
            expect(segmentRanges[0].end).toBe(319775);

            expect(segmentRanges[7].begin).toBe(2232636);
            expect(segmentRanges[7].end).toBe(2439946);
            done();
        });
    });
});