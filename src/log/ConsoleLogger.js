Dash.log.ConsoleLogger = function ($console) {
    'use strict';

    var logMessageToConsole = function (level, message) {
        switch (level) {
            case Dash.log.LogLevel.DEBUG:
                $console.debug(message);
                break;
            case Dash.log.LogLevel.INFO:
                $console.info(message);
                break;
            case Dash.log.LogLevel.WARN:
                $console.warn(message);
                break;
            case Dash.log.LogLevel.ERROR:
                $console.error(message);
                break;
        }
    };

    return {
        onMessageReceived: function (event) {
            logMessageToConsole(event.value.level, event.value.message);
        },

        logMessage: function (level, message) {
            logMessageToConsole(level, message);
        }
    };
};
