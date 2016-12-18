const Scope = require('./Scope');
const Check = require('../Check');

class ProgramScope {
    constructor() {
        this.rootScope = new Scope(this, null);
        this.variableScopes = new Map();
    }

    getRootScope() {
        return this.rootScope;
    }

    setVariableScope(node, scope) {
        if (this.variableScopes.has(node)) {
            throw new Error(`Variable ${node} already has a defined scope`);
        }
        this.variableScopes.set(node, scope);
    }

    getVariableScope(node) {
        debugger;
        return Check.notNull(this.variableScopes.get(node));
    }
}

module.exports = ProgramScope;
