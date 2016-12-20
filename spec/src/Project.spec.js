const Project = require('../../src/Project');
const Vinyl = require('vinyl');

describe('Project', () => {
    it('should have files', () => {
        const project = new Project();
        const file = new Vinyl({ base: '/', path: '/test.txt', contents: Buffer.from('stuff') });
        project.addFile(file);

        expect(project.hasFile('test.txt')).toBe(true);
        expect(project.getFile('test.txt')).toBe(file);
        project.moveFile('test.txt', 'test2.txt');
        expect(project.hasFile('test.txt')).toBe(false);
        expect(project.hasFile('test2.txt')).toBe(true);
    });
});
