const jsbeautify = require('js-beautify');

const customMatchers = {
    codeEquals(util, customEqualityTesters) {
        return {
            compare(optionalActual, optionalExpected) {
                const expected = optionalExpected || '';
                const actual = optionalActual || '';
                const result = {};
                const formattedActual = jsbeautify(actual);
                const formattedExpected = jsbeautify(expected);
                result.pass = util.equals(formattedActual,
                    formattedExpected, customEqualityTesters);

                const not = result.pass ? 'not ' : '';
                result.message = `Expected\n${formattedActual}\n${not} to equal\n${formattedExpected}\n`;
                return result;
            },
        };
    },
};

beforeEach(() => {
    jasmine.addMatchers(customMatchers);
});
