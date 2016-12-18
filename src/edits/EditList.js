const AbstractEdit = require('./AbstractEdit');
const Edit = require('./Edit');
const Check = require('../Check');

class EditList extends AbstractEdit {
    constructor() {
        super();
        this.edits = [];
    }

    addEdit(edit) {
        Check.isInstanceOf(edit, Edit);
        this.edits.forEach((e) => {
            if (e.overlaps(edit)) {
                throw new Error(`Edits overlap ${e.toString()} ${edit.toString()}`);
            }
        });
        this.edits.push(edit);
        return this;
    }

    reverseSortedEdits() {
        return this.edits.slice()
            .sort((e1, e2) => e2.replace.end - e1.replace.end);
    }

    apply(project) {
        this.reverseSortedEdits().forEach(e => e.apply(project));
    }
}

module.exports = EditList;
