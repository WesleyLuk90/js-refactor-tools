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
    canInsertFunction(node) {
        return !!node.body && (node.type === 'BlockStatement' || node.type === 'Program' || node.type === 'ClassBody');
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
    isVariableReference(node) {
        return node.type === 'Identifier';
    },
    getNodeChildren(node, type) {
        const arrayNodes = [];
        AstTools.NODE_KEYS[type].forEach((key) => {
            if (node.type === 'Literal' && key === 'value') {
                return;
            }
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
    walkNodeChildren(nodeOrNodes, callback) {
        Check.isFunction(callback);
        const nodes = Array.isArray(nodeOrNodes) ? nodeOrNodes : [nodeOrNodes];
        nodes.forEach((n) => {
            callback(n);
            AstTools.getNodeChildren(n, 'CHILDREN')
                .forEach(nc => AstTools.walkNodeChildren(nc, callback));
        });
    },
    isVariableAssignment(node) {
        return node.type === 'VariableDeclarator';
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
