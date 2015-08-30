describe('ConsoleLogger', function () {
    var console, consoleLogger;

    beforeEach(function () {
        console = {
            debug: function (message) {

            },
            info: function (message) {

            },
            warn: function (message) {

            },
            error: function (message) {

            }
        };

        consoleLogger = Dash.log.ConsoleLogger(console);

        spyOn(console, 'debug');
        spyOn(console, 'info');
        spyOn(console, 'warn');
        spyOn(console, 'error');
    });

    it('should not interact with console for unknown log level', function () {
        consoleLogger.logMessage('Wrong level', 'message');

        expect(console.debug.calls.any()).toEqual(false);
        expect(console.info.calls.any()).toEqual(false);
        expect(console.warn.calls.any()).toEqual(false);
        expect(console.debug.calls.any()).toEqual(false);
    });

    it('should log message from event', function () {
        var logMessage = 'logMessage';
        consoleLogger.onMessageReceived({
            value: {
                level: Dash.log.LogLevel.INFO, message: logMessage
            }
        });

        expect(console.debug.calls.any()).toEqual(false);
        expect(console.info.calls.allArgs()).toEqual([[logMessage]]);
        expect(console.warn.calls.any()).toEqual(false);
        expect(console.debug.calls.any()).toEqual(false);
    });

    it('should log message on different levels', function () {
        var logMessage = 'logMessage';
        consoleLogger.logMessage(Dash.log.LogLevel.ERROR, logMessage);
        consoleLogger.logMessage(Dash.log.LogLevel.WARN, logMessage);


        expect(console.debug.calls.any()).toEqual(false);
        expect(console.info.calls.any()).toEqual(false);

        expect(console.warn.calls.count()).toEqual(1);
        expect(console.error.calls.count()).toEqual(1);
    });

});