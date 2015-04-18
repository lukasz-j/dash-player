Dash.utils.StreamingManager = function (mpdModel, playingMode) {

    var adaptationSet = mpdModel.getPeriod().getVideoAdaptationSet('mp4'),
        representationManager;

    switch (playingMode.type) {
        case 'quality':
            representationManager = Dash.utils.RepresentationManager(adaptationSet, function (availableRepresentations) {
                for (var i = 0; i < availableRepresentations.length; ++i) {
                    if (availableRepresentations[i].getWidth() === playingMode.width) {
                        return i;
                    }
                }
                return 0;
            });
            break;
        case 'fuzzy':
            break;
        case 'pid':
            break;
        default:
            throw new Error('Unsupported playing mode ' + playingMode.name);
    }


    var currentRepresentation = representationManager.getCurrentRepresentation(),
        currentRepresentationSegment = currentRepresentation.getSegment(),
        headerURL = currentRepresentationSegment.getHeaderURL(),
        currentElementId = 0;

    var onHeaderDownloadSuccess = function (request, loadedBytes, downloadTime) {
        var headers = new Uint8Array(request.response);
        var segmentURLs = currentRepresentationSegment.getSegmentURLs(headers);
        console.log();
    };

    AsyncDownloader().downloadBinaryFile(headerURL, onHeaderDownloadSuccess);
};