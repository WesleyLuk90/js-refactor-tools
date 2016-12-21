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

    getActions(originalProject, project) {
        return project.getFiles()
            .map(file => this.getAction(originalProject, file));
    }

    getAction(originalProject, file) {
        return () => {
            const firstPath = file.history[0];
            const originalFile = originalProject.getFile(path.relative(file.base, firstPath));
            if (file.history.length === 1 && file.contents.equals(originalFile.contents)) {
                return null;
            }
            return this.writeFile(file.path, file.contents)
                .then(() => {
                    if (file.history.length > 1 && firstPath !== file.path) {
                        this.unlink(firstPath);
                    }
                });
        };
    }

    apply(originalProject, project) {
        const actions = this.getActions(originalProject, project);
        return actions.reduce((lastPromise, action) => lastPromise.then(action), Promise.resolve());
    }
}

module.exports = ProjectApplier;
