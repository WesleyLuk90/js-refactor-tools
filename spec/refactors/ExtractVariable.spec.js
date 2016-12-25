const toolkit = require('../../toolkit');

describe('ExtractVariable', () => {
    it('should extract a file scoped variable', () => {
        const project = toolkit.newProject()
            .addFile('index.js', 'const a = 1 + 2 + 3;')
            .applyRefactor('extract_variable',
                toolkit
                .newOptions()
                .option('variableName', 'cat')
                .inputFromRegex('index.js', /const a = (1 \+ 2) \+ 3;/));

        expect(project.getFileContents('index.js')).toEqual('const cat = 1 + 2;const a = cat + 3;');
    });
    it('should extract a function scoped variable', () => {
        const project = toolkit.newProject()
            .addFile('index.js', 'function myFunction() { const a = 1 + 2 + 3; }')
            .applyRefactor('extract_variable',
                toolkit
                .newOptions()
                .option('variableName', 'cat')
                .inputFromRegex('index.js', /const a = (1 \+ 2) \+ 3;/));

        expect(project.getFileContents('index.js')).toEqual('function myFunction() { const cat = 1 + 2;const a = cat + 3; }');
    });
    it('should extract from a class method', () => {
        const project = toolkit.newProject()
            .addFile('index.js', 'class MyClass { myFunction() { const a = 1 + 2 + 3; } }')
            .applyRefactor('extract_variable',
                toolkit
                .newOptions()
                .option('variableName', 'cat')
                .inputFromRegex('index.js', /const a = (1 \+ 2) \+ 3;/));

        expect(project.getFileContents('index.js')).toEqual('class MyClass { myFunction() { const cat = 1 + 2;const a = cat + 3; } }');
    });
    fit('should extract a function call', () => {
        const project = toolkit.newProject()
            .addFile('index.js', 'const value = some.method().toCall();')
            .applyRefactor('extract_variable',
                toolkit
                .newOptions()
                .option('variableName', 'cat')
                .inputFromRegex('index.js', /const value = (some\.method\(\))\.toCall\(\);/));

        expect(project.getFileContents('index.js'))
            .toEqual('const cat = some.method();const value = cat.toCall();');
    });
});
