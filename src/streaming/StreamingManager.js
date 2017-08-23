Dash.streaming.StreamingManager = function (adaptationSet, initRepresentation, sourceBuffer,
                                            initializationCallback, segmentDownloadCallback, eventBus) {
    'use strict';

    var bufferManager = Dash.streaming.BufferManager(sourceBuffer, adaptationSet.getMediaType()),
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
        isFrozen = false,
        pendingRepresentationChange = {available: false, index: 0},

        downloadBinaryFile = function (url, onSuccess, onFailure, onProgress) {
            if (typeof url === 'string') {
                asyncDownloader.downloadBinaryFile(url, onSuccess, onFailure, onProgress);
            } else {
                asyncDownloader.downloadBinaryFilePart(url.url, onSuccess, onProgress, onProgress, url.range);
            }
        },

        notifyRepresentationChange = function (changedRepresentation) {
            var logMessage = 'Representation changed for ' + adaptationSet.getMediaType().name +
                ', number: ' + changedRepresentation.orderNumber + ', id: ' + changedRepresentation.getId() +
                ', bandwidth: ' + changedRepresentation.getBandwidth();

            eventBus.dispatchEvent({type: Dash.event.Events.REPRESENTATION_CHANGED, value: currentRepresentation});
            eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);
        },

        updateValuesAfterChangingRepresentation = function (changedRepresentationIndex) {
            currentRepresentationIndex = changedRepresentationIndex;
            currentRepresentation = availableRepresentationSortedByBandwidth[currentRepresentationIndex];
            currentInitializationHeader = representationRepository.getHeader(currentRepresentation);
            availableSegmentURLs = currentRepresentation.getSegment().getSegmentURLs();

            notifyRepresentationChange(currentRepresentation);
            bufferManager.appendBuffer(currentInitializationHeader);
        },

        notifySuccessfulSegmentDownload = function (requestOptions) {
            var logMessage = 'Segment ' + currentSegmentIndex + '/' + availableSegmentURLs.length +
                ' downloaded for ' + adaptationSet.getMediaType().name + ' url: ' + requestOptions.url +
                ' size: ' + Dash.utils.CommonUtils.prettyPrintFileSize(requestOptions.size) +
                ' time: ' + Dash.utils.CommonUtils.prettyPrintDownloadDuration(requestOptions.duration) +
                ' bandwidth: ' + Dash.utils.CommonUtils.computeBandwidth(requestOptions) + ' bps';

            eventBus.dispatchEvent(
                {
                    type: Dash.event.Events.SEGMENT_DOWNLOADED,
                    value: {
                        mediaType: adaptationSet.getMediaType(),
                        currentSegment: currentSegmentIndex,
                        maxSegment: availableSegmentURLs.length,
                        requestDetails: requestOptions
                    }
                }
            );
            eventBus.dispatchLogEvent(Dash.log.LogLevel.DEBUG, logMessage);
        },

        onSegmentDownload = function (request, options) {
            notifySuccessfulSegmentDownload(options);

            var arrayBuffer = new Uint8Array(request.response);

            // when unable to append data due to full buffer, re-schedule it
            if (bufferManager.appendBuffer(arrayBuffer) == Dash.streaming.BufferManagerState.FULL) {
                setTimeout(function() {
                    onSegmentDownload(request, options);
                }, 3000);
                eventBus.dispatchLogEvent(Dash.log.LogLevel.WARN, adaptationSet.getMediaType().name + ' buffer full, delaying appending');
                return;
            }
//            representationRepository.appendBuffer(currentRepresentation, currentSegmentIndex, arrayBuffer);

            if (pendingRepresentationChange.available && pendingRepresentationChange.index !== currentRepresentationIndex) {
                updateValuesAfterChangingRepresentation(pendingRepresentationChange.index);
                pendingRepresentationChange.available = false;
            }

            segmentDownloadCallback.call(this, request, options);
        },

        findRepresentationByItsId = function (representationId) {
            for (var i = 0; i < availableRepresentationSortedByBandwidth.length; i += 1) {
                if (availableRepresentationSortedByBandwidth[i].getId() === representationId) {
                    return i;
                }
            }
            return -1;
        },

        changeRepresentationBySteps = function (steps) {
            var changedRepresentationIndex = currentRepresentationIndex + steps;

            if (changedRepresentationIndex < lowestRepresentationIndex) {
                changedRepresentationIndex = 0;
            } else if (changedRepresentationIndex > highestRepresentationIndex) {
                changedRepresentationIndex = highestRepresentationIndex;
            }

            pendingRepresentationChange.available = true;
            pendingRepresentationChange.index = changedRepresentationIndex;
        },

        changeRepresentationByItsId = function (representationId) {
            var representationIndex = findRepresentationByItsId(representationId);
            if (representationIndex === -1) {
                eventBus.logMessage(Dash.log.LogLevel.ERROR,
                    'Cannot changed representation. Representations with index ' + representationId + ' not found');
            } else {
                pendingRepresentationChange.available = true;
                pendingRepresentationChange.index = representationIndex;
            }
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

                onDownloadSuccess = function (request, options) {
                    var logMessage = 'Initialization header successfully downloaded for ' + adaptationSet.getMediaType().name +
                        ' representation, number: ' + representation.orderNumber + ', id: ' + representation.getId() +
                        ', bandwidth: ' + representation.getBandwidth() + ', url: ' + options.url;

                    eventBus.dispatchLogEvent(Dash.log.LogLevel.INFO, logMessage);

                    var header = new Uint8Array(request.response);
                    representationRepository.addRepresentation(representation, header, options.url);

                    var segment = representation.getSegment();
                    if (segment.name === 'RangeSegment') {
                        segment.computeSegmentRanges(header);
                    }

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
                availableSegmentURLs = currentRepresentation.getSegment().getSegmentURLs();
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
                eventBus.logMessage(Dash.log.LogLevel.ERROR,
                    'Cannot append next segment to buffer because its already finished for ' + adaptationSet.getMediaType());
            }
        },

        isStreamingFinished: function () {
            return currentSegmentIndex === availableSegmentURLs.length;
        },

        changeRepresentationToHigher: function (steps) {
            if (!steps || steps < 0) {
                steps = 1;
            }
            changeRepresentationBySteps(steps);
        },

        changeRepresentation: function (representationId) {
            changeRepresentationByItsId(representationId);
        },

        changeRepresentationToLower: function (steps) {
            if (!steps || steps < 0) {
                steps = 1;
            }
            changeRepresentationBySteps(-steps);
        },

        isFrozen: function() {
            return isFrozen;
        },

        setFrozen: function(frozen) {
            isFrozen = frozen;
        },

        getBufferedPlaybackLength: function(videoElement) {
            // simple model, assume we're at last existing buffered segment
            // this can result in deadlocks when seeking randomly through video
            var lastPlayed = videoElement.played.length - 1;
            var lastBuffer = sourceBuffer.buffered.length - 1;
            return (lastBuffer >= 0 ? sourceBuffer.buffered.end(lastBuffer) : 0) -
                    (lastPlayed >= 0 ? videoElement.played.end(lastPlayed) : 0);
        }
    };
};
