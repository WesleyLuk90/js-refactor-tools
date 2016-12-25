const RenameRefactor = require('./refactors/RenameRefactor');
const MoveRefactor = require('./refactors/MoveRefactor');
const ExtractVariableRefactor = require('./refactors/ExtractVariableRefactor');
const ExtractFunctionRefactor = require('./refactors/ExtractFunctionRefactor');

class RefactorFactory {
    create(name) {
        switch (name) {
            case 'rename':
                return new RenameRefactor();
            case 'move':
                return new MoveRefactor();
            case 'extract_variable':
                return new ExtractVariableRefactor();
            case 'extract_function':
                return new ExtractFunctionRefactor();
            default:
                throw new Error(`Unknown refactor ${name}`);
        }
    }
}


module.exports = RefactorFactory;
