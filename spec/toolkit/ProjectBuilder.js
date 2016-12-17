const Vinyl = require('vinyl');
class ProjectBuilder {
    constructor() {
        this.files = [];
    }

    addFile(path, contents) {
        this.files.push(new Vinyl({ path: path, contents: Buffer.from(contents) }));
        return this;
    }
}

module.exports = ProjectBuilder;
