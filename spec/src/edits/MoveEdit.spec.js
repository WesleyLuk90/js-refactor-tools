const Edit = require('../../../src/edits/Edit');
const toolkit = require('../../../toolkit');

describe('MoveEdit', () => {
    let project;

    beforeEach(() => {
        project = toolkit.newProject()
            .addFile('/index.txt', 'aaa')
            .build();
    });
    it('should move files', () => {
        const edit = Edit.move('/index.txt', '/otherfile.txt');
        edit.apply(project);

        expect(project.getFile('/otherfile.txt')).toBeTruthy();
        expect(project.hasFile('/index.txt')).toBe(false);
    });
});
