const acorn = require('acorn');

module.exports = {
    nodeContainsSelection(node, selection) {
        return node.start <= selection.start && node.end >= selection.end;
    },
    nodeBeforeSelection(node, selection) {
        return node.start <= selection.start && node.end <= selection.start;
    },
    parse(program) {
        return acorn.parse(program);
    },
};
