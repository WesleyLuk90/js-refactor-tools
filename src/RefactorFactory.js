const RenameRefactor = require('./refactors/RenameRefactor');
const MoveRefactor = require('./refactors/MoveRefactor');

class RefactorFactory {
    create(name, project) {
        switch (name) {
            case 'rename':
                return new RenameRefactor(project);
            case 'move':
                return new MoveRefactor(project);
            default:
                throw new Error(`Unknown refactor ${name}`);
        }
    }
}


module.exports = RefactorFactory;
