Dash.event.EventBus = function () {
    'use strict';

    var registeredListeners = {}, //Map<EventStringName, List<ListenerFunctions>>

        findListenersForEventType = function (type) {
            if (!registeredListeners.hasOwnProperty(type)) {
                registeredListeners[type] = [];
            }
            return registeredListeners[type];
        };

    return {
        addEventListener: function (type, listener) {
            var availableListeners = findListenersForEventType(type);

            if (availableListeners.indexOf(listener) === -1) {
                availableListeners.push(listener);
                return true;
            } else {
                return false;
            }
        },

        removeEventListener: function (type, listener) {
            var availableListeners = findListenersForEventType(type),
                listenerIndex = availableListeners.indexOf(listener);

            if (listenerIndex > -1) {
                availableListeners.splice(listenerIndex, 1);
                return true;
            } else {
                return false;
            }

        },

        dispatchEvent: function (event) {
            var availableListeners = findListenersForEventType(event.type);

            for (var i = 0; i < availableListeners.length; i += 1) {
                availableListeners[i].call(this, event);
            }
        },

        dispatchLogEvent: function (level, message) {
            this.dispatchEvent({type: Dash.event.Events.LOG_MESSAGE, value: {level: level, message: message}});
        }
    };
};
