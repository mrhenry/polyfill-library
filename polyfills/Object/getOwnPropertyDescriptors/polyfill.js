// https://github.com/tc39/proposal-object-getownpropertydescriptors#proposed-solution
if (!Object.hasOwnProperty('getOwnPropertyDescriptors')) {
    Object.defineProperty(
        Object,
        'getOwnPropertyDescriptors',
        {
            configurable: true,
            writable: true,
            value: function getOwnPropertyDescriptors(object) {
                if (object == null) throw new TypeError(object + ' is not an object');

                return Reflect.ownKeys(object).reduce(function(descriptors, key) {
                    return Object.defineProperty(
                        descriptors,
                        key,
                        {
                            configurable: true,
                            enumerable: true,
                            writable: true,
                            value: Object.getOwnPropertyDescriptor(object, key)
                      }
                  );
                }, {});
            }
        }
    );
}
