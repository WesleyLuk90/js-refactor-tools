const Vinyl = require('vinyl');
const RefactorFactory = require('../src/RefactorFactory');
const Project = require('../src/Project');
const path = require('path');

class ProjectBuilder {
    constructor() {
        this.files = [];
    }

    addFile(filePath, contents) {
        this.files.push(new Vinyl({ path: filePath, contents: Buffer.from(contents) }));
        return this;
    }

    applyRefactor(name, options) {
        const project = new Project();
        project.addFiles(this.files);
        project.setOptions(options.createOptions(this));
        const refactor = new RefactorFactory().create(name, project);
        return refactor.apply();
    }

    getFile(fileName) {
        const file = this.files.filter(f => f.path === path.normalize(fileName))[0];
        if (!file) {
            throw new Error(`Failed to find file ${fileName}`);
        }
        return file;
    }

    getFileContents(fileName) {
        return this.getFile(fileName).contents.toString();
    }
}

module.exports = ProjectBuilder;
