const RenameRefactor = require('./refactors/RenameRefactor');
const MoveRefactor = require('./refactors/MoveRefactor');

class RefactorFactory {
    create(name) {
        switch (name) {
            case 'rename':
                return new RenameRefactor();
            case 'move':
                return new MoveRefactor();
            default:
                throw new Error(`Unknown refactor ${name}`);
        }
    }
}


module.exports = RefactorFactory;
