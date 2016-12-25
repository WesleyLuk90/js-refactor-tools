const InputFinder = require('../../toolkit/InputFinder');

describe('InputFinder', () => {
    it('should find input from regex', () => {
        const fileContents = `
call();
const con = 'world';
`;
        const regex = /call\(\);\nconst (con)/;

        const inputFinder = new InputFinder('/index.js', fileContents, regex);
        expect(inputFinder.getSelection()).toEqual({ filePath: '/index.js', start: 15, end: 18 });
    });
    it('should find input from the whole string', () => {
        const fileContents = 'abc';
        const regex = /(abc)/;

        const inputFinder = new InputFinder('/index.js', fileContents, regex);
        expect(inputFinder.getSelection()).toEqual({ filePath: '/index.js', start: 0, end: 3 });
    });
    it('should find input with escaped parenthesis', () => {
        const fileContents = '()()abc()()';
        const regex = /\(\)\(\)(abc)\(\)\(\)/;

        const inputFinder = new InputFinder('/index.js', fileContents, regex);
        expect(inputFinder.getSelection()).toEqual({ filePath: '/index.js', start: 4, end: 7 });
    });
});
