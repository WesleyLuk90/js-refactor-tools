const AstTools = require('../../src/AstTools');

describe('AstTools', () => {
    it('should check contains', () => {
        expect(AstTools.nodeContainsSelection({ start: 1, end: 30 }, { start: 10, end: 20 }))
            .toBe(true);
        expect(AstTools.nodeContainsSelection({ start: 10, end: 20 }, { start: 10, end: 20 }))
            .toBe(true);
        expect(AstTools.nodeContainsSelection({ start: 1, end: 15 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeContainsSelection({ start: 1, end: 10 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeContainsSelection({ start: 15, end: 25 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeContainsSelection({ start: 20, end: 30 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeContainsSelection({ start: 11, end: 19 }, { start: 10, end: 20 }))
            .toBe(false);
    });
    it('should check after', () => {
        expect(AstTools.nodeBeforeSelection({ start: 1, end: 30 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeBeforeSelection({ start: 10, end: 20 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeBeforeSelection({ start: 1, end: 15 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeBeforeSelection({ start: 1, end: 10 }, { start: 10, end: 20 }))
            .toBe(true);
        expect(AstTools.nodeBeforeSelection({ start: 15, end: 25 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeBeforeSelection({ start: 20, end: 30 }, { start: 10, end: 20 }))
            .toBe(false);
        expect(AstTools.nodeBeforeSelection({ start: 11, end: 19 }, { start: 10, end: 20 }))
            .toBe(false);
    });
});
