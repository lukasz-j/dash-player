Dash.adaptation.BatteryDischargingSimulator = function(interval, levelDrop) {
    var callback = function() {
        var current = dashPlayer.adaptationManager.conditionsHolder.getExternalCondition('batteryLevel');
        if (current) {
            if (typeof(current) !== 'number') {
                current = parseInt(current);
            }
            current -= levelDrop;
            if (current < 0) {
                current = 0;
            }
            dashPlayer.adaptationManager.conditionsHolder.setExternalCondition('batteryLevel', current);
        };
    };
    var intervalId = setInterval(callback, interval * 1000);
    return {
        stop: function() {
            clearInterval(intervalId);
        }
    };
};
