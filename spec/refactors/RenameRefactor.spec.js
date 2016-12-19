const toolkit = require('../../toolkit');

describe('RenameRefactor', () => {
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

        it('should rename only scoped variables', () => {
            const project = toolkit.newProject()
                .addFile('/index.js', `
var a;
a + 1;
function b() { var a = 2; }
`)
                .applyRefactor('rename',
                    toolkit
                    .newOptions()
                    .inputFromRegex('/index.js', /var (a)/)
                    .option('newName', 'cat'));

            expect(project.getFileContents('/index.js')).toEqual(`
var cat;
cat + 1;
function b() { var a = 2; }
`);
        });

        it('should rename classes', () => {
            const project = toolkit.newProject()
                .addFile('/index.js', `
class MyClass {
    static MyClass() {
        return new MyClass();
    }
}
class MyClass2 extends MyClass {
}
const myClass = new MyClass();
`)
                .applyRefactor('rename',
                    toolkit
                    .newOptions()
                    .inputFromRegex('/index.js', /class (MyClass) /)
                    .option('newName', 'MyNewClass'));

            expect(project.getFileContents('/index.js')).toEqual(`
class MyNewClass {
    static MyClass() {
        return new MyNewClass();
    }
}
class MyClass2 extends MyNewClass {
}
const myClass = new MyNewClass();
`);
        });
    });
});
