/* eslint-disable no-unused-vars */
class AbstractEdit {
    apply(project) {
        throw new Error('Not Implemented');
    }

    overlaps(otherEdit) {
        throw new Error('Not Implemented');
    }

    toString() {
        throw new Error('Not Implemented');
    }
}

module.exports = AbstractEdit;
