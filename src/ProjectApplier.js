const path = require('path');

class ProjectApplier {
    constructor(fs) {
        this.fs = fs;
    }

    unlink(file) {
        return new Promise((resolve, reject) => {
            this.fs.unlink(file, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    writeFile(file, buffer) {
        return new Promise((resolve, reject) => {
            this.fs.writeFile(file, buffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    apply(originalProject, project) {
        project.getFiles()
            .forEach((file) => {
                const firstPath = file.history[0];
                const originalFile = originalProject.getFile(path.relative(file.base, firstPath));
                if (file.history.length === 1 && file.contents.equals(originalFile.contents)) {
                    return;
                }
                this.writeFile(file.path, file.contents);
                if (file.history.length > 1 && firstPath !== file.path) {
                    this.unlink(firstPath);
                }
            });
    }
}

module.exports = ProjectApplier;
