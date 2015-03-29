var AsyncDownloader = function () {
    return {
        download: function (url, isBytes, asyncDownloadOnReady, asyncDownloadOnProgress) {
            var request = new XMLHttpRequest();
            if(isBytes) {
                request.responseType = "arraybuffer";
            }
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
