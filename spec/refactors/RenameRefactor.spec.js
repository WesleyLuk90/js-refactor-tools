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
        it('should rename a function', () => {
            const project = toolkit.newProject()
                .addFile('/index.js', `
function abc() {}
abc();
const d = abc;
`)
                .applyRefactor('rename',
                    toolkit
                    .newOptions()
                    .inputFromRegex('/index.js', /function (abc)\(\)/)
                    .option('newName', 'def'));

            expect(project.getFileContents('/index.js')).toEqual(`
function def() {}
def();
const d = def;
`);
        });
    });
});
