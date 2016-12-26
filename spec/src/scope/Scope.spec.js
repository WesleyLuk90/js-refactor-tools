const Scope = require('../../../src/scope/Scope');

describe('Scope', () => {
    describe('hierarchy', () => {
        it('should check if its the root node', () => {
            expect(new Scope().isRoot()).toBe(true);
            expect(new Scope(null, new Scope()).isRoot()).toBe(false);
        });
        it('should if it is the ancestor', () => {
            const root = new Scope();
            const child1 = new Scope(null, root);
            const child2 = new Scope(null, root);
            expect(child1.isAncestorOf(child2)).toBe(false);
            expect(root.isAncestorOf(child1)).toBe(true);
            expect(child1.isAncestorOf(root)).toBe(false);
            expect(child1.isAncestorOf(child1)).toBe(false);
        });
        it('should if it is the descendant', () => {
            const root = new Scope();
            const child1 = new Scope(null, root);
            const child2 = new Scope(null, root);
            expect(child1.isDescendantOf(child2)).toBe(false);
            expect(root.isDescendantOf(child1)).toBe(false);
            expect(child1.isDescendantOf(root)).toBe(true);
            expect(child1.isDescendantOf(child1)).toBe(false);
        });
    });
});
