const Project = require('./Project');
const Check = require('./Check');
const AstTools = require('./AstTools');
const ScopeBuilder = require('./scope/ScopeBuilder');

class AbstractRefactor {
    constructor(project) {
        if (!(project instanceof Project)) {
            throw new Error('Expected a project');
        }
        this.project = project;
    }

    getOptions() {
        return this.project.getOptions();
    }

    apply() {
        throw new Error('Not Implemented');
    }

    getParsedFile(fileName, suppliedOptions) {
        Check.isString(fileName);
        const options = Object.assign({}, suppliedOptions);
        const fileContents = this.project.getFileContents(fileName);
        const parse = {};
        try {
            parse.ast = AstTools.parse(fileContents, this.getOptions().getParseOptions());
        } catch (e) {
            console.log(`Error when parsing file contents\n${fileContents}`);
            throw e;
        }
        if (options.buildScope) {
            parse.programScope = new ScopeBuilder(parse.ast).build();
        }
        return parse;
    }
}

module.exports = AbstractRefactor;
