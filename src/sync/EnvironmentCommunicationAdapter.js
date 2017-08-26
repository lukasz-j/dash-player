Dash.sync.EnvironmentCommunicationAdapter = function() {

    var enclosedInApplication = false;

    return {
        setDownloaderProxy: function(callback) {
            Dash.utils.setAsyncDownloaderProxy(callback);
        },
        injectAdaptationProfiles: function(data) {
            dashPlayer.adaptationManager.importProfiles(data);
        },
        provideAdaptationProfilesForPersistence: function() {
            return dashPlayer.adaptationManager.exportProfiles();
        },
        setExternalCondition: function(condition, value) {
            dashPlayer.adaptationManager.conditionsHolder.setExternalCondition(condition, value);
        },
        setEnclosedInApplication: function(is) {
            enclosedInApplication = is;
            eventBus.dispatchEvent({type: Dash.event.Events.ENCLOSED_IN_APP_UPDATE, value: is});
        },
        isEnclosedInApplication: function() {
            return enclosedInApplication;
        }
    };
};
