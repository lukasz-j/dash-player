Dash.streaming.RepresentationRepository = function () {
    'use strict';

    var repository = {},
        checkIfRepresentationIsInitialized = function (representationId) {
            if (repository[representationId] === undefined) {
                throw new Error('Representation buffer not initialized for representation - ' + representationId);
            }
        };

    return {
        addRepresentation: function (representation, header, url) {
            var representationId = representation.getId();
            repository[representationId] = {header: header, buffer: [], url: url};
        },

        appendBuffer: function (representation, partId, bufferPart) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            if (repository[representationId].buffer[partId] === undefined) {
                repository[representationId].buffer[partId] = bufferPart;
            }
        },

        isBufferAlreadyDownloaded: function (representation, partId) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].buffer[partId] !== undefined;
        },

        getHeader: function (representation) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].header;
        },

        getHeaderUrl: function (representation) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].url;
        },

        getBuffer: function (representation, partId) {
            var representationId = representation.getId();
            checkIfRepresentationIsInitialized(representationId);

            return repository[representationId].buffer[partId];
        },

        //only for debug purpose, delete
        getRepository: function () {
            return repository;
        }
    };
};
