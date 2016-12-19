const AbstractEdit = require('./AbstractEdit');
const Check = require('../Check');
const Edit = require('./Edit');

class EditList extends AbstractEdit {
    constructor() {
        super();
        this.edits = [];
    }

    addEdit(edit) {
        Check.isInstanceOf(edit, AbstractEdit);
        this.edits.forEach((e) => {
            if (Edit.editsOverlap(e, edit)) {
                throw new Error(`Edits overlap ${e.toString()} ${edit.toString()}`);
            }
        });
        this.edits.push(edit);
        return this;
    }

    addEdits(edits) {
        edits.forEach(e => this.addEdit(e));
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
