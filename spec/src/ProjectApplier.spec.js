const toolkit = require('../../toolkit');
const ProjectApplier = require('../../src/ProjectApplier');
const path = require('path');

describe('ProjectApplier', () => {
    let fs;
    beforeEach(() => {
        fs = {
            unlink: jasmine.createSpy('unlink').and.callFake((file, callback) => callback()),
            writeFile: jasmine.createSpy('unlink').and.callFake((file, data, callback) => callback()),
        };
    });

    it('should apply changes', () => {
        const project = toolkit.newProject()
            .addFile('a.txt', 'a')
            .addFile('b.txt', 'b')
            .addFile('c.txt', 'b')
            .build();
        const originalProject = project.clone();
        project.moveFile('a.txt', 'd.txt');
        project.getFile('b.txt').contents = Buffer.from('hello');

        const applier = new ProjectApplier(fs);
        applier.apply(originalProject, project);

        expect(fs.unlink.calls.count()).toBe(1);
        expect(fs.unlink).toHaveBeenCalledWith(path.normalize('/var/projects/a.txt'), jasmine.any(Function));
        expect(fs.writeFile.calls.count()).toBe(2);
        expect(fs.writeFile).toHaveBeenCalledWith(path.normalize('/var/projects/b.txt'), Buffer.from('hello'), jasmine.any(Function));
        expect(fs.writeFile).toHaveBeenCalledWith(path.normalize('/var/projects/d.txt'), Buffer.from('a'), jasmine.any(Function));
    });
});
