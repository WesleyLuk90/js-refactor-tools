const Options = require('./Options');
const Check = require('./Check');
const path = require('path');

class Project {
    constructor() {
        this.files = [];
    }

    getFiles() {
        return this.files.slice();
    }

    addFile(file) {
        this.files.push(file);
        return this;
    }

    addFiles(files) {
        files.forEach(f => this.addFile(f));
        return this;
    }

    addFilesStream(stream) {
        return new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('data', file => this.addFile(file));
            stream.on('end', resolve);
        });
    }

    moveFile(filePath, newPath) {
        const file = this.getFile(filePath);
        file.path = path.join(file.base, newPath);
    }

    hasFile(filePath) {
        return !!this._getFile(filePath);
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
        const file = this._getFile(filePath);
        if (!file) {
            throw new Error(`Failed to find file ${filePath}`);
        }
        return file;
    }

    _getFile(filePath) {
        return this.files.filter(f => f.relative === path.normalize(filePath))[0];
    }

    getFileContents(filePath) {
        return this.getFile(filePath).contents.toString();
    }

    clone() {
        return new Project().addFiles(this.getFiles().map(f => f.clone()));
    }
}

module.exports = Project;
