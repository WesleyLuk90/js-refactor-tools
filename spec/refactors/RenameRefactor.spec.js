const toolkit = require('../../toolkit');

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
                    .inputFromRegex('/index.js', /var (a)/)
                    .option('newName', 'cat'));

            expect(project.getFileContents('/index.js')).toEqual(`
var cat = 10;
call(cat);
var b = cat + 1;
`);
        });
    });
});
