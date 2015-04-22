Dash.utils.StreamingManager = function (mpdModel, playingMode) {
    'use strict';

    var adaptationSet = mpdModel.getPeriod().getVideoAdaptationSet('mp4'),
        representationManager,
        videoSource;

    switch (playingMode.type) {
        case 'quality':
            representationManager = Dash.utils.RepresentationManager(adaptationSet, function (availableRepresentations) {
                for (var i = 0; i < availableRepresentations.length; i += 1) {
                    if (availableRepresentations[i].getHeight() === playingMode.height) {
                        return i;
                    }
                }
                return 0;
            });
            break;
        case 'fuzzy':
            break;
        case 'pid':
            break;
        default:
            throw new Error('Unsupported playing mode ' + playingMode.name);
    }


    var currentRepresentation = representationManager.getCurrentRepresentation(),
        currentRepresentationSegment = currentRepresentation.getSegment(),
        headerURL = currentRepresentationSegment.getHeaderURL(),
        currentElementId = -1,
        segmentURLs;

    var onHeaderDownloadSuccess = function (request, loadedBytes, downloadTime) {
        var headers = new Uint8Array(request.response);
        segmentURLs = currentRepresentationSegment.getSegmentURLs(headers);
        videoSource.appendBuffer(headers);
        currentElementId += 1;

        AsyncDownloader().downloadBinaryFile(segmentURLs[currentElementId], onSuccessPart);

    };

    var onSuccessPart = function (request, loadedBytes, downloadTime) {
        videoSource.appendBuffer(new Uint8Array(request.response));
        currentElementId += 1;

        if (currentElementId < segmentURLs.length) {
            AsyncDownloader().downloadBinaryFile(segmentURLs[currentElementId], onSuccessPart);
        } else {
            //fixme should it be this way?
            videoSource.endOfStream();
        }
    };


    return {
        startStreaming: function (mediaSource) {
            mediaSource.addEventListener('sourceopen', function () {
                try {
                    var mediaSourceInitString =
                        Dash.utils.CommonUtils.createSourceBufferInitString(adaptationSet, currentRepresentation);
                    videoSource = mediaSource.addSourceBuffer(mediaSourceInitString);
                    AsyncDownloader().downloadBinaryFile(headerURL, onHeaderDownloadSuccess);
                } catch (e) {
                    console.log('Exception calling addSourceBuffer for video', e);
                }
            }, false);
        },

        getRepresentationManager: function () {
            return representationManager;
        }
    };
};