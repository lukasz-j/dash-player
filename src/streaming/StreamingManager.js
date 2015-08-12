Dash.streaming.StreamingManager = function (mpdModel, playbackStatusManager, options) {
    'use strict';

    var adaptationSet = mpdModel.getPeriod().getAdaptationSet(options.mediaType, Dash.model.MediaFormat.MP4),
        representationManager,
        representationRepository = Dash.streaming.RepresentationRepository(),
        asyncDownloader = Dash.utils.AsyncDownloader(),
        sourceBuffer,

        downloadAvailableHeaders = function (onDownloadAllHeadersSuccess) {
            var representationIndex = -1,
                currentRepresentation,
                headerURL,
                availableRepresentations = adaptationSet.getRepresentations(),

                moveToNextRepresentation = function () {
                    representationIndex += 1;

                    if (representationIndex < availableRepresentations.length) {
                        currentRepresentation = availableRepresentations[representationIndex];
                        headerURL = currentRepresentation.getSegment().getInitializationURL();
                        return true;
                    } else {
                        return false;
                    }
                },

                onDownloadSuccess = function (request, loaded, options) {
                    var header = new Uint8Array(request.response);
                    representationRepository.addRepresentation(currentRepresentation, header, options.url);

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
                segmentURLs = currentRepresentation.getSegment().getSegmentURLs(currentHeader),

                onDownloadSuccess = function (request, loadedBytes, options) {
                    var buffer = new Uint8Array(request.response);

                    representationRepository.appendBuffer(currentRepresentation, currentElementId, buffer);
                    sourceBuffer.appendBuffer(buffer);
                    console.log("Appending buffer from " + options.url);

                    currentElementId += 1;

                    if (currentElementId < segmentURLs.length) {
                        asyncDownloader.downloadBinaryFile(segmentURLs[currentElementId], onDownloadSuccess);
                    } else {
                        sourceBuffer.endOfStream();
                    }
                };

            console.log("Adding initialization from " + representationRepository.getHeaderUrl(currentRepresentation));
            sourceBuffer.appendBuffer(representationRepository.getHeader(currentRepresentation));
            currentElementId += 1;
            asyncDownloader.downloadBinaryFile(segmentURLs[currentElementId], onDownloadSuccess);
        },

        createRepresentationManager = function () {
            switch (options.initType) {
                case 'quality':
                    return Dash.streaming.RepresentationManager(adaptationSet, playbackStatusManager,
                        function (availableRepresentations) {
                            for (var i = 0; i < availableRepresentations.length; i += 1) {
                                if (availableRepresentations[i].getHeight() === options.value) {
                                    return i;
                                }
                            }
                            return 0;
                        });
                case 'bandwidth':
                    return Dash.streaming.RepresentationManager(adaptationSet, playbackStatusManager,
                        function (availableRepresentations) {
                            for (var i = 1; i < availableRepresentations.length; i += 1) {
                                if (availableRepresentations[i].getBandwidth() > options.value) {
                                    return i - 1;
                                }
                            }
                            return availableRepresentations.length - 1;
                        });
                case 'fuzzy':
                    break;
                case 'pid':
                    break;
                default:
                    throw new Error('Unsupported initialization mode ' + options.initType);
            }
        };

    representationManager = createRepresentationManager();

    return {
        initializeStreaming: function (mediaSource) {
            if (adaptationSet === undefined) {
                console.log('Adaptation set for type ' + options.mediaType + ' is not available - cannot initialize streaming');
                return;
            }

            try {
                var mediaSourceInitString =
                    Dash.utils.CommonUtils.createSourceBufferInitString(adaptationSet, representationManager.getCurrentRepresentation());
                sourceBuffer = mediaSource.addSourceBuffer(mediaSourceInitString);
            } catch (e) {
                console.log('Exception calling addSourceBuffer for video', e);
            }
        },

        startStreaming: function () {
            if (adaptationSet === undefined) {
                console.log('Adaptation set for type ' + options.mediaType + ' is not available - cannot initialize streaming');
                return;
            }

            downloadAvailableHeaders(startStreaming);
        },

        getRepresentationManager: function () {
            return representationManager;
        }
    }
}
;