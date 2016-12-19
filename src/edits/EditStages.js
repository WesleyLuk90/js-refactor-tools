const AbstractEdit = require('./AbstractEdit');
const Check = require('../Check');

class EditStages extends AbstractEdit {
    constructor() {
        super();
        this.stages = [];
    }

    addStage(edit) {
        Check.isInstanceOf(edit, AbstractEdit);
        this.stages.push(edit);
    }
    apply(project) {
        this.stages.forEach(edit => edit.apply(project));
    }
}

module.exports = EditStages;
