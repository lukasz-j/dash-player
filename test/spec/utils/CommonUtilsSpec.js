describe('CommonUtils', function () {
    var commonUtils = Dash.utils.CommonUtils;

    describe('creating source buffer strings', function () {
        var adaptationSet,
            representation;

        beforeEach(function () {
            adaptationSet = MpdModelHelper.createAdaptationSetStub();
            representation = MpdModelHelper.createRepresentationStub();
        });

        it('should use codecs from adaptation set to create string', function () {
            spyOn(adaptationSet, 'getCodecs').and.returnValue('codec1');
            spyOn(representation, 'getCodecs').and.returnValue('wrong_codec');
            spyOn(adaptationSet, 'getMimeType').and.returnValue('video');

            expect(commonUtils.createSourceBufferInitString(adaptationSet, representation)).toBe('video; codecs="codec1"');
        });

        it('should use codecs from representation to create string', function () {
            spyOn(adaptationSet, 'getCodecs').and.returnValue(null);
            spyOn(representation, 'getCodecs').and.returnValue('good_codec');
            spyOn(adaptationSet, 'getMimeType').and.returnValue('audio');

            expect(commonUtils.createSourceBufferInitString(adaptationSet, representation)).toBe('audio; codecs="good_codec"');
        });
    });

    describe('converting duration to pretty string', function () {
        it('should create proper values', function () {
            var values = [
                {input: 1024, expected: '17:04'},
                {input: 1080, expected: '18:00'},
                {input: 3600, expected: '1:00:00'},
                {input: 10.5, expected: '10.50'}
            ];

            values.forEach(function (element) {
                expect(commonUtils.convertDurationInSecondsToPrettyString(element.input)).toBe(element.expected);
            });
        });
    });

    describe('pretty print files size', function () {
        it('should create proper strings', function () {
            var values = [
                {input: 1023, expected: '1023 B'},
                {input: 1024, expected: '1.00 KB'},
                {input: 2500, expected: '2.44 KB'},
                {input: 1235324, expected: '1.18 MB'}
            ];

            values.forEach(function (element) {
                expect(commonUtils.prettyPrintFileSize(element.input)).toBe(element.expected);
            });
        });
    });

    describe('pretty print download duration', function () {
        it('should create proper strings', function () {
            var values = [
                {input: 752, expected: '752 ms'},
                {input: 1000, expected: '1.000 s'},
                {input: 1562, expected: '1.562 s'}
            ];

            values.forEach(function (element) {
                expect(commonUtils.prettyPrintDownloadDuration(element.input)).toBe(element.expected);
            });
        });
    });

});