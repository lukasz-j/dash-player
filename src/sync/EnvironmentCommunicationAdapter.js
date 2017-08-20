Dash.sync.EnvironmentCommunicationAdapter = function() {
    return {
        setDownloaderProxy: function(callback) {
            Dash.utils.setAsyncDownloaderProxy(callback);
        },
        injectAdaptationProfiles: function(data) {
            dashPlayer.adaptationManager.importProfiles(data);
        },
        provideAdaptationProfilesForPersistence: function() {
            return dashPlayer.adaptationManager.exportProfiles();
        }
    };
};
