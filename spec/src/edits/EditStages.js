const Edit = require('../../../src/edits/Edit');
const toolkit = require('../../../toolkit');
const EditStages = require('../../../src/edits/EditStages');

describe('EditStages', () => {
    it('should apply edits in order', () => {
        const project = toolkit.newProject()
            .addFile('/a', 'a')
            .build();
        const editStages = new EditStages();
        editStages.addStage(Edit.replace('/a', 0, 1, 'b'));
        editStages.addStage(Edit.replace('/a', 0, 1, 'c'));
        editStages.apply(project);

        expect(project.getFileContents('/a').toString()).toBe('c');
    });
});
