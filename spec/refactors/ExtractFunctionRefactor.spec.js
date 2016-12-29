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
    describe('with parameters', () => {
        it('should not inclue parameters if they are in scope', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'const a = 10; const b = thing(a); call(a);')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(const b = thing\(a\); call\(a\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('const a = 10; function extracted() { const b = thing(a); call(a); } extracted();');
        });
        it('should include parameters if they are scoped', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'const b = 20; function myFunction(){ const a = 10; thing(a + 20 + b); }')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(thing\(a \+ 20 \+ b\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('const b = 20; function extracted(a) { thing(a + 20 + b); } function myFunction() { const a = 10; extracted(a); }');
        });
        it('should not include class variables', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'class MyClass { myMethod() { const a = 10; this.process(a, this.value); } }')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(this\.process\(a, this\.value\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('class MyClass { extracted(a) { this.process(a, this.value); } myMethod() { const a = 10; this.extracted(a); } }');
        });
        it('should only include referenced variables', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'class MyClass { myMethod() { const a = 10; const b = 20; this.process(a); } }')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(this\.process\(a\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('class MyClass { extracted(a) { this.process(a); } myMethod() { const a = 10; const b = 20; this.extracted(a); } }');
        });
    });
    describe('with return value', () => {
        it('should return a value if it is used later in the scope', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'const a = 10; const b = thing(a); call(b);')
                .applyRefactor('extract_function',
                    toolkit
                    .newOptions()
                    .option('functionName', 'extracted')
                    .inputFromRegex('index.js', /(const a = 10; const b = thing\(a\);)/));

            expect(project.getFileContents('index.js'))
                .codeEquals('function extracted() { const a = 10; const b = thing(a); return b; } const b = extracted(); call(b);');
        });
        it('should throw an error if it multiple values need to be returned', () => {
            expect(() => {
                toolkit.newProject()
                    .addFile('index.js', 'const a = 10; const b = thing(a); call(b); call(a);')
                    .applyRefactor('extract_function',
                        toolkit
                        .newOptions()
                        .option('functionName', 'extracted')
                        .inputFromRegex('index.js', /(const a = 10; const b = thing\(a\);)/));
            }).toThrowError('More than one variable is assigned to in the block');
        });
    });
});
