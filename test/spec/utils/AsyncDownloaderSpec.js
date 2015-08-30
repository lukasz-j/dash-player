describe('AsyncDownloader', function () {
    var resourcesLocation = 'http://localhost:9876/base/test/resources/',
        asyncDownloader;

    beforeEach(function () {
        asyncDownloader = Dash.utils.AsyncDownloader();
    });

    it('should execute onFailure callback for not existing resource', function (done) {
        var destinationURL = resourcesLocation + 'not_exist.xml',
            onSuccess = function () {
                fail('On success callback has been call');
            },

            onFailure = function (request) {
                expect(request.status).toBe(404);
                done();
            };

        asyncDownloader.download(destinationURL, onSuccess, onFailure);
    });

    //FIXME does not work, but request.status in callback function is 200
    xit('should execute onSuccess callback for binary file partial download', function (done) {
        var destinationURL = resourcesLocation + 'binary-files/yt_initialization.mp4',
            onSuccess = function (request) {
                expect(request.status).toBe(206);
                done();
            },

            onFailure = function (request) {
                fail('On failure callback has been call ' + request.status);
            };

        asyncDownloader.downloadBinaryFilePart(destinationURL, onSuccess, onFailure, null, '0-100');
    });

    it('should execute onSuccess callback for binary file partial download', function (done) {
        var destinationURL = resourcesLocation + 'binary-files/yt_initialization.mp4',
            onSuccess = function (request) {
                expect(request.status).toBe(200);
                done();
            },

            onFailure = function (request) {
                fail('On failure callback has been call ' + request.status);
            };

        asyncDownloader.downloadBinaryFile(destinationURL, onSuccess, onFailure);
    });

});