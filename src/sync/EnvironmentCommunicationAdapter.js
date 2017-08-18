Dash.sync.EnvironmentCommunicationAdapter = function() {
    return {
        setDownloaderProxy: function(callback) {
            Dash.utils.setAsyncDownloaderProxy(callback);
        }
    };
};
