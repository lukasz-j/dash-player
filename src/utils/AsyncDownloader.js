Dash.utils.AsyncDownloader = function () {
    'use strict';

    var sendHttpGetRequest = function (url, expectedStatusCode, requestOnSuccess, requestOnFailure, requestOnProgress, responseType, range) {
        var request = new XMLHttpRequest(),
            startTime,
            requestDuration;

        expectedStatusCode = expectedStatusCode || 200;

        if (responseType) {
            request.responseType = responseType;
        }

        if (requestOnProgress) {
            request.onprogress = requestOnProgress;
        }

        request.onload = function (event) {
            if (request.status === expectedStatusCode) {
                requestDuration = new Date() - startTime;
                requestOnSuccess(request, event.loaded, {url: url, duration: requestDuration});
            } else {
                if (requestOnFailure) {
                    requestOnFailure(request);
                }
            }
        };

        startTime = new Date();
        request.open('GET', url, true);
        if (range) {
            request.setRequestHeader('Range', 'bytes=' + range);
        }
        request.send();
    };


    return {
        downloadBinaryFilePart: function (url, requestOnSuccess, requestOnFailure, requestOnProgress, range) {
            sendHttpGetRequest(url, 206, requestOnSuccess, requestOnFailure, requestOnProgress, "arraybuffer", range);
        },

        downloadBinaryFile: function (url, requestOnSuccess, requestOnFailure, requestOnProgress) {
            sendHttpGetRequest(url, 200, requestOnSuccess, requestOnFailure, requestOnProgress, "arraybuffer");
        },

        download: function (url, requestOnSuccess, requestOnFailure, requestOnProgress) {
            sendHttpGetRequest(url, 200, requestOnSuccess, requestOnFailure, requestOnProgress);
        }
    };
};
