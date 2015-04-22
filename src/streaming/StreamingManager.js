Dash.streaming.StreamingManager = function (mpdModel, playingMode) {
    'use strict';

    var adaptationSet = mpdModel.getPeriod().getVideoAdaptationSet('mp4'),
        representationManager,
        representationRepository = Dash.streaming.RepresentationRepository(),
        asyncDownloader = Dash.utils.AsyncDownloader(),
        videoSource,

        downloadAvailableHeaders = function (onDownloadAllHeadersSuccess) {
            var representationIndex = -1,
                currentRepresentation,
                headerURL,
                availableRepresentations = adaptationSet.getRepresentations(),

                moveToNextRepresentation = function () {
                    representationIndex += 1;

                    if (representationIndex < availableRepresentations.length) {
                        currentRepresentation = availableRepresentations[representationIndex];
                        headerURL = currentRepresentation.getSegment().getHeaderURL();
                        return true;
                    } else {
                        return false;
                    }
                },

                onDownloadSuccess = function (request) {
                    var header = new Uint8Array(request.response);
                    representationRepository.addRepresentation(currentRepresentation, header);

                    if (moveToNextRepresentation()) {
                        asyncDownloader.downloadBinaryFile(headerURL, onDownloadSuccess);
                    } else {
                        onDownloadAllHeadersSuccess();
                    }
                };

            moveToNextRepresentation();
            asyncDownloader.downloadBinaryFile(headerURL, onDownloadSuccess);
        },

        startStreaming = function () {
            var currentElementId = -1,
                currentRepresentation = representationManager.getCurrentRepresentation(),
                currentHeader = representationRepository.getHeader(currentRepresentation),
                segmentURLs = currentRepresentation.getSegment().getSegmentURLs(currentHeader);

            var onDownloadSuccess = function (request, loadedBytes, downloadTime) {
                var buffer = new Uint8Array(request.response);

                representationRepository.appendBuffer(currentRepresentation, currentElementId, buffer);
                videoSource.appendBuffer(buffer);

                currentElementId += 1;

                if (currentElementId < segmentURLs.length) {
                    asyncDownloader.downloadBinaryFile(segmentURLs[currentElementId], onDownloadSuccess);
                } else {
                    videoSource.endOfStream();
                }
            };

            videoSource.appendBuffer(representationRepository.getHeader(currentRepresentation));
            currentElementId += 1;
            asyncDownloader.downloadBinaryFile(segmentURLs[currentElementId], onDownloadSuccess);
        },

        createRepresentationManager = function () {
            switch (playingMode.type) {
                case 'quality':
                    return Dash.streaming.RepresentationManager(adaptationSet, function (availableRepresentations) {
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
        };

    representationManager = createRepresentationManager();

    return {
        startStreaming: function (mediaSource) {
            mediaSource.addEventListener('sourceopen', function () {
                try {
                    var mediaSourceInitString =
                        Dash.utils.CommonUtils.createSourceBufferInitString(adaptationSet, representationManager.getCurrentRepresentation());
                    videoSource = mediaSource.addSourceBuffer(mediaSourceInitString);
                    downloadAvailableHeaders(startStreaming);
                } catch (e) {
                    console.log('Exception calling addSourceBuffer for video', e);
                }
            }, false);
        },

        getRepresentationManager: function () {
            return representationManager;
        }
    }
};