Dash.streaming.RepresentationManager = function (adaptationSet, chooseStartRepresentation) {
    'use strict';

    var availableRepresentations = adaptationSet.getRepresentations(),
        currentRepresentationIndex = chooseStartRepresentation(availableRepresentations);

    return {
        getCurrentRepresentation: function () {
            return availableRepresentations[currentRepresentationIndex];
        },

        isPresentRepresentationHighest: function () {
            return currentRepresentationIndex === availableRepresentations.length - 1;
        },

        switchRepresentationToHigher: function (hopNumber) {
            hopNumber = hopNumber || 1;

            if (currentRepresentationIndex + hopNumber >= availableRepresentations.length) {
                currentRepresentationIndex = availableRepresentations.length - 1;
            } else {
                currentRepresentationIndex = currentRepresentationIndex + hopNumber;
            }

            return availableRepresentations[currentRepresentationIndex];
        },

        isPresentRepresentationLowest: function () {
            return currentRepresentationIndex === 0;
        },

        switchRepresentationToLower: function (hopNumber) {
            hopNumber = hopNumber || 1;

            if (currentRepresentationIndex - hopNumber < 0) {
                currentRepresentationIndex = 0;
            } else {
                currentRepresentationIndex = currentRepresentationIndex - hopNumber;
            }

            return availableRepresentations[currentRepresentationIndex];
        }
    };
};
