Dash.adaptation.NetworkType = {
    CELLULAR: 1,
    WI_FI: 2
}

Dash.adaptation.PlaybackConditionsHolder = function() {
    var averageThroughputs = [],
    recordNewThroughput = function(thp) {
        averageThroughputs.forEach(function(avg) {
            avg.push(thp);
        });
    },
    externalConditions = {};
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
        getProvidedExternalConditions: function() {
            var list = [];
            for (var key in externalConditions) {
                list.push(key);
            }
            return list;
        },
        getExternalCondition: function(condition) {
            return externalConditions[condition];
        },
        setExternalCondition: function(condition, value) {
            if (null === value) {
                delete externalConditions[condition];
            }
            else {
                externalConditions[condition] = value;
            }
            eventBus.dispatchEvent({
                type: Dash.event.Events.EXTERNAL_CONDITION_CHANGE,
                name: condition,
                value: value
            });
        }
    };
};
