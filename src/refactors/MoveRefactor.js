const AbstractRefactor = require('../AbstractRefactor');
const Edit = require('../edits/Edit');
const EditList = require('../edits/EditList');
const AstTools = require('../AstTools');
const path = require('path');
const EditStages = require('../edits/EditStages');
const Check = require('../Check');
const NodePaths = require('../NodePaths');

const MODE_OTHER_FILE = 'MODE_OTHER_FILE';
const MODE_SELF_FILE = 'MODE_SELF_FILE';

class NodeIterator {
    constructor(project, filePath, rootNode, mode) {
        this.project = Check.notNull(project);
        this.filePath = Check.isString(filePath);
        this.rootNode = Check.notNull(rootNode);
        this.mode = Check.isString(mode);
    }

    addMatchingNodes(node) {
        const importNode = this.getImportNode(node);
        if (!importNode) {
            return;
        }
        if (this.mode === MODE_OTHER_FILE) {
            if (this.isMatchingPath(this.filePath, importNode.value)) {
                const newPath = NodePaths.importPath(this.filePath, this.project.getOptions().get('targetFile'));
                const newPathLiteral = `'${newPath}'`;
                const replaceEdit = Edit
                    .replace(this.filePath, importNode.start, importNode.end, newPathLiteral);
                this.editList.push(replaceEdit);
            }
        }
        if (this.mode === MODE_SELF_FILE) {
            const matchingFilePath = this.getMatchingFilePath(this.filePath, importNode.value);
            if (matchingFilePath) {
                const newPath = NodePaths.importPath(this.project.getOptions().get('targetFile'), matchingFilePath);
                const newPathLiteral = `'${newPath}'`;
                const replaceEdit = Edit
                    .replace(this.filePath, importNode.start, importNode.end, newPathLiteral);
                this.editList.push(replaceEdit);
            }
        }
    }

    recurse(node) {
        this.addMatchingNodes(node);
        AstTools.getNodeChildren(node, 'CHILDREN')
            .forEach(child => this.recurse(child));
    }

    getEdits() {
        this.editList = [];
        this.recurse(this.rootNode);
        return this.editList;
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

    isMatchingPath(filePath, importPath) {
        const sourceFile = path.normalize(this.project.getOptions().get('sourceFile'));
        return NodePaths.resolvePath(filePath, importPath)
            .some(p => p === sourceFile);
    }

    getMatchingFilePath(filePath, importPath) {
        const resolvedPaths = NodePaths.resolvePath(filePath, importPath);
        for (let i = 0; i < resolvedPaths.length; i++) {
            if (this.project.hasFile(resolvedPaths[i])) {
                return resolvedPaths[i];
            }
        }
        return null;
    }
}

class MoveRefactor extends AbstractRefactor {

    getEdit(project) {
        const editStages = new EditStages();
        const files = project.getFiles();
        const fileEdits = files.map(file => this.getFileEdits(project, file.relative));
        const edits = [].concat(...fileEdits);
        editStages.addStage(new EditList().addEdits(edits));
        const options = project.getOptions();
        editStages.addStage(Edit.move(options.get('sourceFile'), options.get('targetFile')));
        return editStages;
    }

    getFileEdits(project, filePath) {
        const sourceFile = path.normalize(project.getOptions().get('sourceFile'));
        if (sourceFile === filePath) {
            return this.getMovedFileEdits(project, filePath);
        } else {
            return this.getOtherFileEdits(project, filePath);
        }
    }

    getOtherFileEdits(project, filePath) {
        const parsed = this.getParsedFile(project, filePath);
        return new NodeIterator(project, filePath, parsed.ast, MODE_OTHER_FILE).getEdits();
    }

    getMovedFileEdits(project, filePath) {
        const parsed = this.getParsedFile(project, filePath);
        return new NodeIterator(project, filePath, parsed.ast, MODE_SELF_FILE).getEdits();
    }
}

module.exports = MoveRefactor;
