Dash.utils.RepresentationManager = function (adaptationSet, availableBandwidth) {

    var availableRepresentations = adaptationSet.getRepresentations();
    var chooseStartRepresentation = function (availableBandwidth) {
        var findProperRepresentationIndex = function (isConditionFulfilled) {
            for (var i = 1; i < availableRepresentations.length; ++i) {
                if (isConditionFulfilled(availableRepresentations[i - 1], availableRepresentations[i])) {
                    return i - 1;
                }
            }
            return availableRepresentations.length - 1;
        };

        if (typeof availableBandwidth === 'undefined') {
            // choose representation less than or equal 360p
            return findProperRepresentationIndex(function (previous, current) {
                return previous.getWidth() <= 360 && current.getWidth() > 360;
            });
        } else {
            //  chose representation less than or equal available bandwidth
            return findProperRepresentationIndex(function (previous, current) {
                return previous.getBandwidth() <= availableBandwidth && current.getBandwidth() > availableBandwidth;
            });
        }
    };

    var currentRepresentationIndex = chooseStartRepresentation(availableBandwidth);


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
    }


};
