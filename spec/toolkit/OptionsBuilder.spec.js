const OptionsBuilder = require('../../toolkit/OptionsBuilder');

describe('OptionsBuilder', () => {
    it('should find input from regex', () => {
        const fileContents = `
call();
const con = 'world';
`;
        const regex = /call\(\);\nconst (con)/;

        const optionsBuilder = new OptionsBuilder();
        optionsBuilder.inputFromRegex('/index.js', regex);
        const mockProjectBuilder = { getFileContents: jasmine.createSpy('getFileContents').and.returnValue(fileContents) };
        const input = optionsBuilder.getSelection(mockProjectBuilder);

        expect(input).toEqual({ filePath: '/index.js', start: 15, end: 18 });
        expect(mockProjectBuilder.getFileContents).toHaveBeenCalledWith('/index.js');
    });
});
