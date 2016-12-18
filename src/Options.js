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
        return { ecmaVersion: 6 };
    }

    set(optionName, value) {
        this.options.set(optionName, value);
    }

    get(optionName) {
        if (!this.options.has(optionName)) {
            throw new Error(`Option ${optionName} is not defined`);
        }
        return this.options.get(optionName);
    }
}

module.exports = Options;
