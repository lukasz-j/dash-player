Dash.adaptation.PlaybackConditionsHolder = function() {
    var averageThroughputs = [],
    recordNewThroughput = function(thp) {
        averageThroughputs.forEach(function(avg) {
            avg.push(thp);
        });
    };
    return {
        configureThroughputHolders: function(throughputHolders) {
            averageThroughputs = [];
            throughputHolders.forEach(function(element) {
                if (typeof(element) == 'number') {
                    averageThroughputs.push(Dash.adaptation.MovingAverage(element));
                }
                // if is moving average
                else if (typeof(element) == 'object' && element.push) {
                    averageThroughputs.push(element);
                }
            });

            eventBus.addEventListener(Dash.event.Events.SEGMENT_DOWNLOADED, function(event) {
                var thp = Dash.utils.CommonUtils.computeBandwidth(event.value.requestDetails);
                recordNewThroughput(thp);
            });
        },
        getAverageThroughput: function(id) {
            return averageThroughputs[id] ? averageThroughputs[id].get() : NaN();
        },

    };
};
