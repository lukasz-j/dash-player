var Utils = function () {
    var rangeParam = "&range=";
    //fixme remove sparams, consider moving to separate class which will be reponsible for all actions connected with choosing representation
    var lastParam = "&sparams";
    return {
        addRangeToBaseUrl: function (baseUrl, start, end) {
            var splitted = baseUrl.split(lastParam);
            return splitted[0] + rangeParam + start + "-" + end + lastParam + splitted[1];
        }
    }


};
