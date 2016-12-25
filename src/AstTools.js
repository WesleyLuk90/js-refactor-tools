const acorn = require('acorn');
const Check = require('./Check');

const AstTools = module.exports = {
    nodeEqualsSelection(node, selection) {
        return node.start === selection.start && node.end === selection.end;
    },
    nodeContainsSelection(node, selection) {
        return node.start <= selection.start && node.end >= selection.end;
    },
    nodeBeforeSelection(node, selection) {
        return node.start <= selection.start && node.end <= selection.start;
    },
    parse(program, options) {
        return acorn.parse(program, options);
    },
    hasStatements(node) {
        return !!node.body;
    },
    createNodeParents(node) {
        class NodeParents {
            constructor(rootNode) {
                this.parents = new Map();
                this.addNode(rootNode);
            }

            addNode(nodeToAdd, parent) {
                this.parents.set(nodeToAdd, parent);

                AstTools.getNodeChildren(nodeToAdd, 'CHILDREN')
                    .forEach(c => this.addNode(c, nodeToAdd));
            }

            getParent(childNode) {
                Check.notNull(childNode);
                return this.parents.get(childNode);
            }
        }
        return new NodeParents(node);
    },
    getNodeChildren(node, type) {
        const arrayNodes = [];
        AstTools.NODE_KEYS[type].forEach((key) => {
            if (node[key]) {
                if (Array.isArray(node[key])) {
                    arrayNodes.push(...node[key]);
                } else {
                    arrayNodes.push(node[key]);
                }
            }
        });
        return arrayNodes;
    },
    NODE_KEYS: {
        CHILDREN: [
            'body',
            'declarations',
            'expression',
            'left',
            'right',
            'callee',
            'arguments',
            'id',
            'argument',
            'init',
            'params',
            'value',
            'superClass',
            'object',
        ],
        FUNCTION_CHILDREN: [
            'id',
        ],
        FUNCTION_SCOPED_CHILDREN: [
            'body',
            'params',
        ],
    },
};
