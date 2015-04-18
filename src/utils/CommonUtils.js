Dash.utils.CommonUtils = {
    createURLWithRange: function (baseURL, startIndex, endIndex) {
        return baseURL + '&range=' + startIndex + '-' + endIndex;
    },

    computeDownloadSpeed: function (bytes, miliseconds) {
        return (bytes / 1024) / (miliseconds / 1000);
    },

    replaceAmpersandsInURL: function (url) {
        return url.replace(/&amp;/g, '&');
    }

};
