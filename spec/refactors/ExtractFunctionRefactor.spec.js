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
        it('should extract a function scoped statements', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'function doThings() { const a = call(); const b = call(); }')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(const a = call\(\); const b = call\(\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('function extracted() { const a = call(); const b = call(); } function doThings() { extracted(); }');
        });
        it('should extract a class scoped statement', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'class MyClass { someMethod() { const a = call(); const b = call(); } }')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(const a = call\(\); const b = call\(\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('class MyClass { extracted() { const a = call(); const b = call(); } someMethod() { this.extracted(); } }');
        });
    });
});
