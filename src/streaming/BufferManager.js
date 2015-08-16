Dash.streaming.BufferManager = function (sourceBuffer) {
    'use strict';

    var bufferQueue = [],

        updateSourceBuffer = function () {
            if (sourceBuffer.updating) {
                setTimeout(updateSourceBuffer, 200);
            } else {
                var arrayBuffer = bufferQueue.pop();
                sourceBuffer.appendBuffer(arrayBuffer);
            }
        };

    return {
        appendBuffer: function (arrayBuffer) {
            bufferQueue.push(arrayBuffer);
            updateSourceBuffer();
        }
    };
};