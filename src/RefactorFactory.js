const RenameRefactor = require('./refactors/RenameRefactor');

class RefactorFactory {
    create(name, project) {
        return new RenameRefactor(project);
    }
}


module.exports = RefactorFactory;
