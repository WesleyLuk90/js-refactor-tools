const Scope = require('./Scope');
const Check = require('../Check');

class ProgramScope {
    constructor() {
        this.rootScope = new Scope(this, null);
        this.nodeScopes = new Map();
    }

    getRootScope() {
        return this.rootScope;
    }

    setNodeScope(node, scope) {
        Check.isObject(node);
        if (this.nodeScopes.has(node)) {
            throw new Error(`Node ${node} already has a defined scope`);
        }
        this.nodeScopes.set(node, scope);
    }

    getNodeScope(node) {
        return Check.notNull(this.nodeScopes.get(node));
    }
}

module.exports = ProgramScope;
