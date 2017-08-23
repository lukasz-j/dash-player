Dash.streaming.BufferManagerState = {
    UPDATED: 1,
    FULL: 2,
    ERROR: 3
};

Dash.streaming.BufferManager = function (sourceBuffer, mediaType) {
    'use strict';

    var bufferQueue = [],

        updateSourceBuffer = function () {
            if (sourceBuffer.updating) {
                setTimeout(updateSourceBuffer, 200);
            } else {
                var arrayBuffer = bufferQueue.pop();
                try {
                    sourceBuffer.appendBuffer(arrayBuffer);
                } catch (e) {
                    if (e instanceof DOMException &&
                        e.name == 'QuotaExceededError') {
                        // buffer full, return to queue and wait for better chance
                        return Dash.streaming.BufferManagerState.FULL;
                    }
                    else {
                        eventBus.dispatchLogEvent(Dash.log.LogLevel.ERROR, 'Streaming for ' + mediaType.name + ' encountered error: ' + e.message);
                        return Dash.streaming.BufferManagerState.ERROR;
                    }
                }
                return Dash.streaming.BufferManagerState.UPDATED;
            }
        };

    return {
        appendBuffer: function (arrayBuffer) {
            bufferQueue.push(arrayBuffer);
            return updateSourceBuffer();
        }
    };
};
