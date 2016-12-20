const AbstractEdit = require('./AbstractEdit');
const Check = require('../Check');

class MoveEdit extends AbstractEdit {
    constructor(sourcePath, targetPath) {
        super();
        Check.pathIsRelative(sourcePath);
        Check.pathIsRelative(targetPath);

        this.sourcePath = sourcePath;
        this.targetPath = targetPath;
    }

    apply(project) {
        project.moveFile(this.sourcePath, this.targetPath);
    }

    overlaps() {
        return true;
    }

    toString() {
        return `Move ${this.sourcePath} to ${this.targetPath}`;
    }
}

module.exports = MoveEdit;
