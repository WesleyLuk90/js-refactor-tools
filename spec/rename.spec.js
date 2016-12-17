const toolkit = require('./toolkit');

describe('rename', () => {
    describe('local variable', () => {
        it('should rename a module scoped variable', () => {
            const project = toolkit.newProject()
                .addFile('/index.js', `
var a = 10;
call(a);
var b = a + 1;
`)
                .applyRefactor('rename',
                    toolkit
                    .newOptions()
                    .inputFromRegex(/var (a)/)
                    .option('newName', 'c')
                );

            project.assertFileContents('/index.js', `
var a = 10;
call(a);
var b = a + 1;
`);
        });
    });
});
