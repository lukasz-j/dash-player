Dash.streaming.DefaultInitRepresentationPicker = function () {
    'use strict';

    var chooseInitRepresentationForVideo = function (representations) {
            //try to choose representation with 480p quality at most
            var clonedRepresentations = representations.slice(0),
                chosenRepresentation;

            clonedRepresentations.sort(function (a, b) {
                return a.getHeight() - b.getHeight();
            });

            chosenRepresentation = clonedRepresentations[0];
            for (var i = 1; i < clonedRepresentations.length; i += 1) {
                if (clonedRepresentations[i].getHeight() > 480) {
                    return chosenRepresentation;
                } else {
                    chosenRepresentation = clonedRepresentations[i];
                }
            }
            return chosenRepresentation;
        },

        chooseInitRepresentationForAudio = function (representations) {
            //choose mid representation
            var index = Math.floor(representations.length / 2);
            return representations[index];
        },

        chooseInitRepresentationForText = function (representations) {
            //choose first
            return representations[0];
        };

    return {
        chooseInitRepresentation: function (representations, mediaType) {
            switch (mediaType) {
                case Dash.model.MediaType.VIDEO:
                    return chooseInitRepresentationForVideo(representations);
                case Dash.model.MediaType.AUDIO:
                    return chooseInitRepresentationForAudio(representations);
                case Dash.model.MediaType.TEXT:
                    return chooseInitRepresentationForText(representations);
            }
        }
    };
};