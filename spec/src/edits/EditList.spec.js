const EditList = require('../../../src/edits/EditList');
const Edit = require('../../../src/edits/Edit');
const toolkit = require('../../../toolkit');

describe('EditList', () => {
    it('should throw an error if edits overlap', () => {
        expect(() => new EditList()
                .addEdit(Edit.replace('a', 1, 3, 'b'))
                .addEdit(Edit.replace('a', 2, 3, 'a')))
            .toThrowError(/Edits overlap a \(1,3\) => b a \(2,3\) => a/);
    });

    it('should apply multiple edits properly', () => {
        const project = toolkit.newProject()
            .addFile('a', 'aaaaa')
            .build();
        new EditList()
            .addEdit(Edit.replace('a', 1, 2, 'bb'))
            .addEdit(Edit.replace('a', 4, 5, 'cc'))
            .apply(project);

        expect(project.getFileContents('a').toString()).toBe('abbaacc');
    });
});
