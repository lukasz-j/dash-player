Dash.streaming.StreamingManager = function (adaptationSet, initRepresentation, sourceBuffer,
                                            initializationCallback, segmentDownloadCallback) {
    'use strict';

    var bufferManager = Dash.streaming.BufferManager(sourceBuffer),
        representationRepository = Dash.streaming.RepresentationRepository(),
        asyncDownloader = Dash.utils.AsyncDownloader(),
        currentRepresentation = initRepresentation,
        currentRepresentationIndex = adaptationSet.getIndexOfRepresentation(initRepresentation),
        availableRepresentationSortedByBandwidth = adaptationSet.getRepresentations(),
        lowestRepresentationIndex = 0,
        highestRepresentationIndex = availableRepresentationSortedByBandwidth.length - 1,
        currentInitializationHeader,
        availableSegmentURLs,
        currentSegmentIndex = 0,
        isInitialized = false,


        downloadBinaryFile = function (url, onSuccess, onFailure, onProgress) {
            if (typeof url === 'string') {
                asyncDownloader.downloadBinaryFile(url, onSuccess, onFailure, onProgress);
            } else {
                asyncDownloader.downloadBinaryFilePart(url.url, onSuccess, onProgress, onProgress, url.range);
            }
        },

        onSegmentDownload = function (request, loaded, options) {
            var arrayBuffer = new Uint8Array(request.response);

            bufferManager.appendBuffer(arrayBuffer);
            representationRepository.appendBuffer(currentRepresentation, currentSegmentIndex, arrayBuffer);

            segmentDownloadCallback.call(this, request, loaded, options);
        },

        updateValuesAfterChangingRepresentation = function (changedRepresentationIndex) {
            currentRepresentationIndex = changedRepresentationIndex;
            currentRepresentation = availableRepresentationSortedByBandwidth[currentRepresentationIndex];
            currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
            availableSegmentURLs = currentRepresentation.getSegmentURLs(currentInitializationHeader);
        },

        changeRepresentation = function (steps) {
            var changedRepresentationIndex = currentRepresentationIndex + steps;

            if (changedRepresentationIndex < lowestRepresentationIndex) {
                changedRepresentationIndex = 0;
            } else if (changedRepresentationIndex > highestRepresentationIndex) {
                changedRepresentationIndex = highestRepresentationIndex;
            }

            updateValuesAfterChangingRepresentation(changedRepresentationIndex);
        },

        downloadAvailableHeaders = function () {
            var index = -1,
                representation,
                initializationURL,

                moveToNextRepresentation = function () {
                    index += 1;

                    if (index < availableRepresentationSortedByBandwidth.length) {
                        representation = availableRepresentationSortedByBandwidth[index];
                        initializationURL = representation.getSegment().getInitializationURL();
                        return true;
                    } else {
                        return false;
                    }
                },

                onDownloadSuccess = function (request, loaded, options) {
                    var header = new Uint8Array(request.response);
                    representationRepository.addRepresentation(representation, header, options.url);

                    if (moveToNextRepresentation()) {
                        downloadBinaryFile(initializationURL, onDownloadSuccess);
                    } else {
                        isInitialized = true;
                    }
                };

            moveToNextRepresentation();
            downloadBinaryFile(initializationURL, onDownloadSuccess);
        };

    downloadAvailableHeaders();

    return {
        appendInitialization: function () {
            var self = this;
            if (!isInitialized) {
                setTimeout(function () {
                    self.appendInitialization();
                }, 500);
            } else {
                currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
                availableSegmentURLs = currentRepresentation.getSegmentURLs(currentInitializationHeader);
                bufferManager.appendBuffer(currentInitializationHeader);
                initializationCallback.call(this);
            }
        },

        appendNextSegment: function () {
            if (!this.isStreamingFinished()) {
                var segmentURL = availableSegmentURLs[currentSegmentIndex];
                downloadBinaryFile(segmentURL, onSegmentDownload);
                currentSegmentIndex += 1;
            } else {
                //TODO exception or log, stream is already full
            }
        },

        isStreamingFinished: function () {
            return currentSegmentIndex === availableSegmentURLs.length;
        },

        changeRepresentationToHigher: function (steps) {
            if (!steps || steps < 0) {
                steps = 1;
            }
            changeRepresentation(steps);
        },

        changeRepresentationToLower: function (steps) {
            if (!steps || steps < 0) {
                steps = 1;
            }
            changeRepresentation(-steps);
        }
    };
};
