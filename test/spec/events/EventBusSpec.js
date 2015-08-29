describe('EventBus', function () {
    var eventBus,
        callbackObject;

    beforeEach(function () {
        eventBus = Dash.event.EventBus();
        callbackObject = {
            x: function () {
                return 'x';
            },
            y: function () {
                return 'y';
            },
            z: function () {
                return 'z';
            }
        };
    });

    it('should not add the same event listener twice', function () {
        var type = 'type';

        expect(eventBus.addEventListener(type, callbackObject.x)).toBe(true);
        expect(eventBus.addEventListener(type, callbackObject.x)).toBe(false);
        expect(eventBus.addEventListener(type, callbackObject.y)).toBe(true);

    });

    it('should properly call registered callbacks', function () {
        var type = 'type';
        var event = {type: type, value: 0};

        spyOn(callbackObject, 'x');
        spyOn(callbackObject, 'y');

        eventBus.addEventListener(type, callbackObject.x);
        eventBus.addEventListener(type, callbackObject.z);
        eventBus.dispatchEvent(event);

        expect(callbackObject.x).toHaveBeenCalledWith(event);
        expect(callbackObject.y).not.toHaveBeenCalled();
        expect(callbackObject.x).toHaveBeenCalledWith(event);
    });

    it('should return false while removing not existing listener', function () {
        var type = "type",
            notRegisteredType = "not_registered";

        eventBus.addEventListener(type, callbackObject.x);

        expect(eventBus.removeEventListener(type, callbackObject.x)).toBe(true);
        expect(eventBus.removeEventListener(type, callbackObject.y)).toBe(false);
        expect(eventBus.removeEventListener(notRegisteredType, callbackObject.x)).toBe(false);
    });
});
