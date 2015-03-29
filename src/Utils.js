var Utils = function () {
    var rangeParam = "&range=";
    var lastParam = "&sparams";
    return {
        addRangeToBaseUrl: function (baseUrl, start, end) {
            var splitted = baseUrl.split(lastParam);
            return splitted[0] + rangeParam + start + "-" + end + lastParam + splitted[1];
        }
    }
};
