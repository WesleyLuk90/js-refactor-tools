const toolkit = require('../../toolkit');

describe('MoveRefactor', () => {
    describe('common js', () => {
        it('should update files in the same directory', () => {
            const project = toolkit.newProject()
                .addFile('index.js', 'const a = 1 + 2 + 3;')
                .applyRefactor('extract_variable',
                    toolkit
                    .newOptions()
                    .option('variableName', 'cat')
                    .inputFromRegex('index.js', /const a = (1 \+ 2) \+ 3;/));

            expect(project.getFileContents('index.js')).toEqual('const cat = 1 + 2;\nconst a = cat + 3;');
        });
    });
});
