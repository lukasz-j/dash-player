Dash.utils.RepresentationManager = function (adaptationSet, chooseStartRepresentation) {
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
            hopNumber = (typeof hopNumber === 'undefined') ? 1 : hopNumber;

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
            hopNumber = (typeof hopNumber === 'undefined') ? 1 : hopNumber;

            if (currentRepresentationIndex - hopNumber < 0) {
                currentRepresentationIndex = 0;
            } else {
                currentRepresentationIndex = currentRepresentationIndex - hopNumber;
            }

            return availableRepresentations[currentRepresentationIndex];
        }
    };
};
