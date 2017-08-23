Dash.adaptation.MovingAverageBase = function(maxLength) {
    if (maxLength == 0) {
        maxLength = 1000000;
    }

    var adjustLength = function() {
        while (this.samples.length > maxLength) {
            var oldest = this.samples.shift();
            if (this.onElementPop) {
                this.onElementPop(oldest);
            }
        }
    }

    return {
        samples: [],
        pushElement: function(value) {
            this.samples.push(value);
            adjustLength.call(this);
        },
        resize: function(newMaxLength) {
            maxLength = newMaxLength;
            adjustLength.call(this);
        }
    };
};

Dash.adaptation.MovingAverage = function(maxLength) {
    var sum = 0.0;
    var avg = Dash.adaptation.MovingAverageBase(maxLength);
    avg.avg = 0.0;
    avg.push = function(value) {
        sum += value;
        this.pushElement(value);
        this.avg = sum / this.samples.length;
    };
    avg.onElementPop = function(value) {
        sum -= value;
        this.avg = sum / this.samples.length;
    };
    avg.get = function() {
        return this.avg;
    };
    return avg;
};

/**
 * @param callback weightFunction returns weight for element.
 * Called with 1 parameter between 0 (least recent) and 1 (most recent)
 */
Dash.adaptation.WeightedMovingAverage = function(maxLength, weightFunction) {
    var avg = Dash.adaptation.MovingAverageBase(maxLength);
    var weights = [];
    for (var i=0; i<maxLength; i++) {
        weights.push(weightFunction(i / (maxLength - 1)));
    }
    avg.push = function(value) {
        var oldest = this.pushElement(value);
    };
    avg.get = function() {
        var sum = 0.0,
            weightSum = 0.0;
        var weightOffset = weights.length - this.samples.length;
        for (var i=0; i<this.samples.length; i++) {
            sum += this.samples[i] * weights[i+weightOffset];
            weightSum += weights[i+weightOffset];
        }
        return weightSum ? sum / weightSum : 0;
    };
    return avg;
};

Dash.adaptation.LinearWeight = function(oldest, recent) {
    return function(x) {
        return oldest + (recent - oldest) * x;
    };
};
