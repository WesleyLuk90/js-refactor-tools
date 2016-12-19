const AbstractRefactor = require('../AbstractRefactor');
const Edit = require('../edits/Edit');
const EditList = require('../edits/EditList');
const AstTools = require('../AstTools');
const path = require('path');
const EditStages = require('../edits/EditStages');

class MoveRefactor extends AbstractRefactor {

    getEdit(project) {
        const editStages = new EditStages();
        const files = project.getFiles();
        const fileEdits = files.map(file => this.getFileEdits(project, file.path));
        const edits = [].concat(...fileEdits);
        editStages.addStage(new EditList().addEdits(edits));
        const options = project.getOptions();
        editStages.addStage(Edit.move(options.get('sourceFile'), options.get('targetFile')));
        return editStages;
    }

    getRequireImport(node) {
        if (node.type !== 'CallExpression') {
            return null;
        }
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'require') {
            return null;
        }
        if (node.arguments.length !== 1) {
            return null;
        }
        const argument = node.arguments[0];
        if (argument.type !== 'Literal') {
            return null;
        }
        const literalPath = argument.value;
        if (literalPath.charAt(0) !== '.') {
            return null;
        }
        return argument;
    }

    getModuleImport(node) {
        if (node.type !== 'ImportDeclaration') {
            return null;
        }
        if (node.source.type !== 'Literal') {
            return null;
        }
        const literalPath = node.source.value;
        if (literalPath.charAt(0) !== '.') {
            return null;
        }
        return node.source;
    }

    getImportNode(node) {
        return this.getRequireImport(node) || this.getModuleImport(node);
    }

    isMatchingPath(project, candidatePath) {
        const sourceFile = path.normalize(project.getOptions().get('sourceFile'));
        const extensions = project.getOptions().getTrimableExtensions();
        extensions.push('');
        return extensions.some(ext => candidatePath + ext === sourceFile);
    }

    toNodeStyle(filePath) {
        const normalizedSlashes = filePath.replace(/\\/g, '/');
        if (normalizedSlashes.charAt(0) !== '.') {
            return `./${normalizedSlashes}`;
        }
        return normalizedSlashes;
    }

    trimExtension(filePath, extensions) {
        const matchingExtension = extensions.filter(e => filePath.endsWith(e))[0];
        if (matchingExtension) {
            return filePath
                .substring(0, filePath.length - matchingExtension.length);
        }
        return filePath;
    }

    newPath(project, fromFile) {
        const fromFileDirectory = path.dirname(fromFile);
        const destinationFile = path.normalize(project.getOptions().get('targetFile'));
        const relativePath = path.relative(fromFileDirectory, destinationFile);
        const nodeStyleRelativePath = this.toNodeStyle(relativePath);
        const extensions = project.getOptions().getTrimableExtensions();
        const pathWithoutExtension = this.trimExtension(nodeStyleRelativePath, extensions);
        return `'${pathWithoutExtension}'`;
    }

    getFileEdits(project, filePath) {
        const parsed = this.getParsedFile(project, filePath);

        const edits = [];

        const addMatchingNodes = (node) => {
            const importNode = this.getImportNode(node);
            if (!importNode) {
                return;
            }
            const resolvedPath = path.join(path.dirname(filePath), importNode.value);
            if (!this.isMatchingPath(project, resolvedPath)) {
                return;
            }
            const newPathLiteral = this.newPath(project, filePath);
            const replaceEdit = Edit
                .replace(filePath, importNode.start, importNode.end, newPathLiteral);
            edits.push(replaceEdit);
        };

        const recurse = (node) => {
            addMatchingNodes(node);
            AstTools.getNodeChildren(node, 'CHILDREN')
                .forEach(child => recurse(child));
        };
        recurse(parsed.ast);
        return edits;
    }
}

module.exports = MoveRefactor;
