Dash.streaming.StreamingManager = function (adaptationSet, initRepresentation, sourceBuffer,
                                            initializationCallback, segmentDownloadCallback, eventBus) {
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
        pendingRepresentationChange = {available: false, index: 0},

        downloadBinaryFile = function (url, onSuccess, onFailure, onProgress) {
            if (typeof url === 'string') {
                asyncDownloader.downloadBinaryFile(url, onSuccess, onFailure, onProgress);
            } else {
                asyncDownloader.downloadBinaryFilePart(url.url, onSuccess, onProgress, onProgress, url.range);
            }
        },

        notifyRepresentationChange = function (changedRepresentation) {
            var logMessage = 'Representation changed for ' + adaptationSet.getMediaType().name
                + ', number: ' + changedRepresentation.orderNumber + ', id: ' + changedRepresentation.getId() + ', bandwidth: ' + changedRepresentation.getBandwidth();

            eventBus.dispatchEvent({type: Dash.event.Events.REPRESENTATION_CHANGED, value: currentRepresentation});
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);
        },

        updateValuesAfterChangingRepresentation = function (changedRepresentationIndex) {
            currentRepresentationIndex = changedRepresentationIndex;
            currentRepresentation = availableRepresentationSortedByBandwidth[currentRepresentationIndex];
            currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
            availableSegmentURLs = currentRepresentation.getSegment().getSegmentURLs(currentInitializationHeader);

            notifyRepresentationChange(currentRepresentation);
            bufferManager.appendBuffer(currentInitializationHeader);
        },

        notifySuccessfulSegmentDownload = function (requestOptions) {
            var logMessage = 'Segment ' + currentSegmentIndex + '/' + availableSegmentURLs.length
                + ' downloaded for ' + adaptationSet.getMediaType().name + ' url: ' + requestOptions.url;

            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
        },

        onSegmentDownload = function (request, loaded, options) {
            notifySuccessfulSegmentDownload(options);

            var arrayBuffer = new Uint8Array(request.response);

            bufferManager.appendBuffer(arrayBuffer);
            representationRepository.appendBuffer(currentRepresentation, currentSegmentIndex, arrayBuffer);

            if (pendingRepresentationChange.available && pendingRepresentationChange.index !== currentRepresentationIndex) {
                updateValuesAfterChangingRepresentation(pendingRepresentationChange.index);
                pendingRepresentationChange.available = false;
            }

            segmentDownloadCallback.call(this, request, loaded, options);
        },

        changeRepresentation = function (steps) {
            var changedRepresentationIndex = currentRepresentationIndex + steps;

            if (changedRepresentationIndex < lowestRepresentationIndex) {
                changedRepresentationIndex = 0;
            } else if (changedRepresentationIndex > highestRepresentationIndex) {
                changedRepresentationIndex = highestRepresentationIndex;
            }

            pendingRepresentationChange.available = true;
            pendingRepresentationChange.index = changedRepresentationIndex;
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
                    var logMessage = 'Initialization header successfully downloaded for ' + adaptationSet.getMediaType().name
                        + ' representation, number: ' + representation.orderNumber + ', id: ' + representation.getId()
                        + ', bandwidth: ' + representation.getBandwidth() + ', url: ' + options.url;

                    eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);

                    var header = new Uint8Array(request.response);
                    representationRepository.addRepresentation(representation, header, options.url);

                    if (moveToNextRepresentation()) {
                        downloadBinaryFile(initializationURL, onDownloadSuccess);
                    } else {
                        isInitialized = true;
                    }
                };

            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Starting downloading headers for all available representations for ' + adaptationSet.getMediaType().name);
            moveToNextRepresentation();
            downloadBinaryFile(initializationURL, onDownloadSuccess);
        };

    downloadAvailableHeaders();

    return {
        getMediaType: function () {
            return adaptationSet.getMediaType();
        },

        appendInitialization: function () {
            var self = this;
            if (!isInitialized) {
                setTimeout(function () {
                    self.appendInitialization();
                }, 500);
            } else {
                eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, 'Appending initialization header to source buffer for ' + adaptationSet.getMediaType().name);
                currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
                availableSegmentURLs = currentRepresentation.getSegment().getSegmentURLs(currentInitializationHeader);
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
