const acorn = require('acorn');

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
    parse(program) {
        return acorn.parse(program);
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
