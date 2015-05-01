Dash.utils.PlaybackStatusManager = function (debugInfoContainerNode) {
    'use strict';

    var mpdLoadedEventName = 'mpdLoadedEvent',
        representationChangedEventName = 'representationChangedEvent',

        mpdInfoNodeId = 'mpdInfo',
        representationInfoNodeId = 'representationInfo',
        videoRepresentationNodeId = 'videoRepresentation',
        audioRepresentationNodeId = 'audioRepresentation',

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

        createContainerWithTitle = function (parent, containerId, title) {
            var previousContainer = document.getElementById(containerId),
                updatedContainer = document.createElement('div'),
                titleNode = document.createElement('p');

            updatedContainer.setAttribute('id', containerId);
            titleNode.innerHTML = title;
            updatedContainer.appendChild(titleNode);

            if (previousContainer) {
                parent.replaceChild(updatedContainer, previousContainer);
            } else {
                parent.appendChild(updatedContainer);
            }

            return updatedContainer;
        },

        updateMPDInfo = function (event) {
            var listParent = document.createElement('ul'),
                mpdModel = event.detail,
                parentDiv = createContainerWithTitle(this, mpdInfoNodeId, 'MPD info');

            createContainerWithTitle(this, representationInfoNodeId, 'Current representation');

            createListNode(listParent, 'MPD type', mpdModel.getType().name);
            createListNode(listParent, 'Profiles', mpdModel.getProfiles());
            createListNode(listParent, 'Duration', mpdModel.getMediaPresentationDuration());
            createListNode(listParent, 'Video sets', getMimesForAdaptationSets(mpdModel.getPeriod().getVideoAdaptationSets()));
            createListNode(listParent, 'Audio sets', getMimesForAdaptationSets(mpdModel.getPeriod().getAudioAdaptationSets()));

            parentDiv.appendChild(listParent);
        },

        updateRepresentationInfo = function (event) {
            var listParent = document.createElement('ul'),
                representation = event.detail,
                representationDiv = document.getElementById(representationInfoNodeId),
                title,
                containerId,
                parentDiv,
                createSpecificInformationForRepresentation;

            if (representation.getAdaptationSet().isVideo()) {
                containerId = videoRepresentationNodeId;
                title = 'Video';
                createSpecificInformationForRepresentation = createInformationForVideoRepresentation;
            } else if (representation.getAdaptationSet().isAudio()) {
                containerId = audioRepresentationNodeId;
                title = 'Audio';
                createSpecificInformationForRepresentation = createInformationForAudioRepresentation;
            } else {
                console.log('Unsupported format found while updating current representation info - '
                    + representation.getAdaptationSet().getMimeType());
                return;
            }

            parentDiv = createContainerWithTitle(representationDiv, containerId, title);
            createCommonInformationForRepresentation(listParent, representation);
            createSpecificInformationForRepresentation(listParent, representation);

            parentDiv.appendChild(listParent);
        };

    debugInfoContainerNode.addEventListener(mpdLoadedEventName, updateMPDInfo, false);
    debugInfoContainerNode.addEventListener(representationChangedEventName, updateRepresentationInfo, false);


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

            debugInfoContainerNode.dispatchEvent(event);
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

            debugInfoContainerNode.dispatchEvent(event);
        }
    };
};