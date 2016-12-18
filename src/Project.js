const Options = require('./Options');
const Check = require('./Check');
const path = require('path');

class Project {
    constructor() {
        this.files = [];
    }

    addFile(file) {
        this.files.push(file);
        return this;
    }

    addFiles(files) {
        files.forEach(f => this.addFile(f));
        return this;
    }

    setOptions(options) {
        Check.isInstanceOf(options, Options);
        this.options = options;
    }

    getOptions() {
        return this.options;
    }

    getFile(filePath) {
        Check.isString(filePath);
        const file = this.files.filter(f => f.path === path.normalize(filePath))[0];
        if (!file) {
            throw new Error(`Failed to find file ${filePath}`);
        }
        return file;
    }

    getFileContents(filePath) {
        return this.getFile(filePath).contents.toString();
    }

    clone() {
        return this;
    }
}

module.exports = Project;
