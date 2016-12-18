const Check = require('../Check');

class Variable {
    constructor(declaration) {
        Check.notNull(declaration);
        this.declaration = declaration;
        this.uses = [];


        Check.isString(this.getName());
        this.addUse(declaration);
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
        if (this.declaration.id) {
            return this.declaration.id.name;
        }
        if (this.declaration.name) {
            return this.declaration.name;
        }
        throw new Error(`Failed to get name of variable ${this}`);
    }
}

module.exports = Variable;
