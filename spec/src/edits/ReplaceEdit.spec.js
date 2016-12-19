const toolkit = require('../../../toolkit');
const Edit = require('../../../src/edits/Edit');

describe('Edit', () => {
    let project;

    beforeEach(() => {
        project = toolkit.newProject()
            .addFile('/index.txt', 'aaa')
            .build();
    });

    it('should calculate delta size', () => {
        expect(Edit.replace('/file.txt', 1, 1, 'a').deltaSize()).toBe(1);
        expect(Edit.replace('/file.txt', 1, 2, 'a').deltaSize()).toBe(0);
        expect(Edit.replace('/file.txt', 1, 1, 'bbb').deltaSize()).toBe(3);
        expect(Edit.replace('/file.txt', 1, 5, '1').deltaSize()).toBe(-3);
    });

    it('should check if they overlap', () => {
        expect(Edit.replace('/file.txt', 1, 2, 'a').overlaps(Edit.replace('/file.txt', 1, 2, 'a'))).toBe(true);
        expect(Edit.replace('/file.txt', 1, 2, 'a').overlaps(Edit.replace('/file.txt', 2, 3, 'a'))).toBe(false);
        expect(Edit.replace('/file.txt', 1, 1, 'a').overlaps(Edit.replace('/file.txt', 0, 2, 'a'))).toBe(true);
        expect(Edit.replace('/file1.txt', 1, 2, 'a').overlaps(Edit.replace('/file2.txt', 1, 2, 'a'))).toBe(false);
    });

    it('should have a to string method', () => {
        expect(Edit.replace('/file.txt', 1, 2, 'a').toString()).toBe('/file.txt (1,2) => a');
    });

    it('should apply edits that make the file longer', () => {
        const edit = Edit.replace('/index.txt', 1, 2, 'bb');
        edit.apply(project);
        const newContent = project.getFileContents('/index.txt');
        expect(newContent.length).toBe(4);
        expect(newContent).toBe('abba');
    });

    it('should apply edits that make the file shorter', () => {
        const edit = Edit.replace('/index.txt', 1, 3, 'b');
        edit.apply(project);
        const newContent = project.getFileContents('/index.txt');
        expect(newContent.length).toBe(2);
        expect(newContent).toBe('ab');
    });

    it('should print to string', () => {

    });
});
