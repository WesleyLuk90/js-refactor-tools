module.exports = {
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
    isInstanceOf(object, klass) {
        if (!(object instanceof klass)) {
            throw new Error(`Expected an instance of ${klass.name} but got ${object}`);
        }
        return object;
    },
    notNull(value) {
        if (value == null) {
            throw new Error('Expected a not null value');
        }
        return value;
    },
};
