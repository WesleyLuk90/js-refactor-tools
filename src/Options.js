const Check = require('./Check');

class Options {
    constructor() {
        this.options = new Map();
    }

    getSelection() {
        return this.selection;
    }

    setSelection(selection) {
        Check.isNumber(selection.start);
        Check.isNumber(selection.end);
        Check.isString(selection.filePath);
        this.selection = selection;
        return this;
    }

    getParseOptions() {
        return {};
    }

    set(optionName, value) {
        this.options.set(optionName, value);
    }

    get(optionName) {
        return this.options.get(optionName);
    }
}

module.exports = Options;
