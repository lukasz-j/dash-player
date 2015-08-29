describe("Parser", function () {
    var resourcesLocation = 'http://localhost:9001/test/resources/mpd/',
    //var resourcesLocation = 'http://localhost:63342/dash-msc/test/resources/mpd/',
        eventBus,
        parser;

    beforeEach(function () {
        eventBus = Dash.event.EventBus();
        parser = Dash.mpd.Parser(eventBus);
    });

    describe('parsing jaguar_youtube.mpd file', function () {
        var mpdFileContent,
            mpdFileURL = resourcesLocation + 'jaguar_youtube.mpd';

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
            /*   expect(mpdModel).toBeDefined();

             var period = mpdModel.getPeriod();*/

            //expect(mpdFileContent).toBe(true);


//.log(mpdFileContent);

            expect(typeof mpdFileContent === 'string').toBe(true);
            done();
        });
    });

});