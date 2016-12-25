const toolkit = require('../../toolkit');

describe('ExtractFunctionRefactor', () => {
    describe('context', () => {
        it('should extract a file scoped statements', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'const a = call(); const b = call();')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(const a = call\(\); const b = call\(\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('function extracted() { const a = call(); const b = call(); } extracted();');
        });
    });
});
