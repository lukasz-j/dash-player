var AsyncDownloader = function () {
    var request = new XMLHttpRequest();
    return {
        download: function (url, asyncDownloadOnReady, asyncDownloadOnProgress) {
            request.open('GET', url, true);
            request.send(null);
            request.onreadystatechange = function (event) {
                var request = event.target;
                if (request.readyState == 4 && request.status === 200) {
                    asyncDownloadOnReady(request);
                }
            };
            if (asyncDownloadOnProgress) {
                request.onprogress = asyncDownloadOnProgress;
            }
        }
    }
};
