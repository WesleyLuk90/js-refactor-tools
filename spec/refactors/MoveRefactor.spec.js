const toolkit = require('../../toolkit');

describe('MoveRefactor', () => {
    describe('common js', () => {
        it('should update files in the same directory', () => {
            const project = toolkit.newProject()
                .addFile('/index.js', "const other = require('./other');")
                .addFile('/other.js', '')
                .applyRefactor('move',
                    toolkit
                    .newOptions()
                    .option('sourceFile', '/other.js')
                    .option('targetFile', '/other2.js'));

            expect(project.getFileContents('/index.js')).toEqual("const other = require('./other2');");
            expect(project.hasFile('/other.js')).toBe(false);
            expect(project.hasFile('/other2.js')).toBe(true);
        });
    });
    describe('module import', () => {
        it('should update files in the same directory', () => {
            const project = toolkit.newProject()
                .addFile('/index.js', "import other from './other';")
                .addFile('/other.js', '')
                .applyRefactor('move',
                    toolkit
                    .newOptions()
                    .option('sourceFile', '/other.js')
                    .option('targetFile', '/other2.js'));

            expect(project.getFileContents('/index.js')).toEqual("import other from './other2';");
            expect(project.hasFile('/other.js')).toBe(false);
            expect(project.hasFile('/other2.js')).toBe(true);
        });
    });
});
