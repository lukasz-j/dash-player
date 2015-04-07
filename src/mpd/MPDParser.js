var MPDParser = function (mpdFileContent) {
    var that = this,
        parsedMpd = new DOMParser().parseFromString(mpdFileContent, "text/xml");

    return {
        generateModel: function () {

        }
    };
};