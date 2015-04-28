Dash.utils.PlaybackStatusManager = function (mpdLoadedElement, representationChangedElement) {
    'use strict';

    var mpdLoadedEventName = 'mpdLoadedEvent',
        representationChangedEventName = 'representationChangedEvent',

        createListNode = function (parent, property, value) {
            var node = document.createElement('li'),
                textNode = document.createTextNode(property + ': ' + value);
            node.appendChild(textNode);

            parent.appendChild(node);
        },

        removeContent = function (parentNode) {
            while (parentNode.firstChild) {
                parentNode.removeChild(parentNode.firstChild);
            }
        },

        getMimesForAdaptationSets = function (adaptationSets) {
            var mimes = [];

            for (var i = 0; i < adaptationSets.length; i += 1) {
                mimes.push(adaptationSets[i].getMimeType());
            }

            return mimes.join(',');
        },

        createCommonInformationForRepresentation = function (listParent, representation) {
            createListNode(listParent, 'Representation id', representation.getId());
            createListNode(listParent, 'Format', representation.getAdaptationSet().getFormat().name);
            createListNode(listParent, 'Codecs', representation.getCodecs());
            createListNode(listParent, 'Bandwidth', representation.getBandwidth());
        },

        createInformationForVideoRepresentation = function (listParent, representation) {
            createListNode(listParent, 'Quality', representation.getHeight());
            createListNode(listParent, 'Frame rate', representation.getFrameRate());
        },

        createInformationForAudioRepresentation = function (listParent, representation) {
            createListNode(listParent, 'Sampling rate', representation.getAudioSamplingRate());
        },

        updateMPDInfo = function (event) {
            var parentDiv = this,
                listParent = document.createElement('ul'),
                mpdModel = event.detail;

            createListNode(listParent, 'MPD type', mpdModel.getType().name);
            createListNode(listParent, 'Profiles', mpdModel.getProfiles());
            createListNode(listParent, 'Duration', mpdModel.getMediaPresentationDuration());
            createListNode(listParent, 'Video sets', getMimesForAdaptationSets(mpdModel.getPeriod().getVideoAdaptationSets()));
            createListNode(listParent, 'Audio sets', getMimesForAdaptationSets(mpdModel.getPeriod().getAudioAdaptationSets()));

            removeContent(parentDiv);
            parentDiv.appendChild(listParent);
        },

        updateRepresentationInfo = function (event) {
            var parentDiv = this,
                listParent = document.createElement('ul'),
                representation = event.detail;

            createCommonInformationForRepresentation(listParent, representation);
            if (representation.getAdaptationSet().isVideo()) {
                createInformationForVideoRepresentation(listParent, representation);
            } else if (representation.getAdaptationSet().isAudio()) {
                createInformationForAudioRepresentation(listParent, representation);
            }

            parentDiv.appendChild(listParent);
        };

    mpdLoadedElement.addEventListener(mpdLoadedEventName, updateMPDInfo, false);
    representationChangedElement.addEventListener(representationChangedEventName, updateRepresentationInfo, false);


    return {
        fireMpdFileLoadedEvent: function (mpdModel) {
            var event = new CustomEvent(
                mpdLoadedEventName,
                {
                    detail: mpdModel,
                    bubbles: true,
                    cancelable: true
                }
            );

            mpdLoadedElement.dispatchEvent(event);
        },

        fireRepresentationChangedEvent: function (representation) {
            var event = new CustomEvent(
                representationChangedEventName,
                {
                    detail: representation,
                    bubbles: true,
                    cancelable: true
                }
            );

            representationChangedElement.dispatchEvent(event);
        }
    };
};