Dash.sync.ExternalCommunicationManager = function() {
    return {
        config: {},
        setConfig: function(config) {
            this.config = config;
        },
        getConfig: function() {
            return this.config;
        },
        currentState: {},
        getCurrentState: function() {
            return this.currentState;
        },
        setCurrentState: function(currentState) {
            this.currentState = currentState;
        }
    };
};
