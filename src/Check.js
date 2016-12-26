const Check = module.exports = {
    isNumber(a) {
        if (typeof a !== 'number') {
            throw new Error(`Expected a number but got ${a}`);
        }
        return a;
    },
    isString(a) {
        if (typeof a !== 'string') {
            throw new Error(`Expected a string but got ${a}`);
        }
        return a;
    },
    isObject(object) {
        Check.notNull(object);
        if (typeof object !== 'object') {
            throw new Error(`Expected an object but got ${object}`);
        }
        return object;
    },
    isInstanceOf(object, klass) {
        if (!(object instanceof klass)) {
            throw new Error(`Expected an instance of ${klass.name} but got ${object}`);
        }
        return object;
    },
    notNull(value, message) {
        if (value == null) {
            throw new Error(message || 'Expected a not null value');
        }
        return value;
    },
    that(value, msg) {
        if (typeof value !== 'boolean') {
            throw new Error('Expected a boolean value');
        }
        if (!value) {
            throw new Error(msg || 'Check failed');
        }
        return value;
    },
    pathIsRelative(filePath) {
        Check.isString(filePath);
        if (filePath.charAt(0) === '/') {
            throw new Error(`Expected a relative path but got ${filePath}`);
        }
        return filePath;
    },
};
