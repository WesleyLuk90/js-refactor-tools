const Check = require('../Check');

class Variable {
    static getName(node) {
        if (node.id) {
            return node.id.name;
        }
        if (node.name) {
            return node.name;
        }
        throw new Error(`Failed to get name of variable ${node}`);
    }
    constructor(name) {
        this.name = Check.isString(name);
        this.uses = [];
    }

    setDeclaration(declaration) {
        Check.notNull(declaration);
        this.declaration = declaration;
    }

    getDeclaration() {
        return this.declaration;
    }

    addUse(node) {
        this.uses.push(node);
    }

    getUses() {
        return this.uses.slice();
    }

    getName() {
        return this.name;
    }
}

module.exports = Variable;
