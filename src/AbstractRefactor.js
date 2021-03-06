const Check = require('./Check');
const AstTools = require('./AstTools');
const ScopeBuilder = require('./scope/ScopeBuilder');
const AbstractEdit = require('./edits/AbstractEdit');
const Project = require('./Project');

/* eslint-disable no-unused-vars */
class AbstractRefactor {

    getEdit(project) {
        throw new Error('Not Implemented');
    }

    apply(project) {
        const edit = this.getEdit(project);
        const outputProject = project.clone();
        Check.isInstanceOf(edit, AbstractEdit);
        edit.apply(outputProject);
        return outputProject;
    }

    getParsedFile(project, fileName, optionalOptions) {
        Check.isInstanceOf(project, Project);
        Check.isString(fileName);
        const options = Object.assign({}, optionalOptions);
        const fileContents = project.getFileContents(fileName);
        const parse = {};
        try {
            parse.ast = AstTools.parse(fileContents, project.getOptions().getParseOptions());
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
