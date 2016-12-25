const Check = require('../src/Check');

class InputFinder {
    constructor(fileName, content, inputRegex) {
        this.fileName = fileName;
        this.content = content;
        this.inputRegex = inputRegex;
    }

    getRegexMatch() {
        return Check.notNull(this.content.match(this.inputRegex), `Expected '${this.content}' to match ${this.inputRegex}`);
    }

    getSelection() {
        const match = this.getRegexMatch();
        const matchedString = match[0];
        const regexComponents = this.getRegexComponents();
        const startLength = this.getMatchedHeaderLength(matchedString, regexComponents[0]);
        const trimmedString = matchedString.substring(startLength);
        const captureMatch = new RegExp(`^${regexComponents[1]}`).exec(trimmedString);
        Check.notNull(captureMatch, `Expected '${trimmedString}' to match /${regexComponents[1]}/`);
        const captureLength = captureMatch[0].length;

        return {
            filePath: this.fileName,
            start: match.index + startLength,
            end: match.index + startLength + captureLength,
        };
    }

    getRegexComponents() {
        const leftParen = '244e5140-465e-435a-afe4-4faf80e045f4';
        const rightParen = '43e8ea21-93a0-481c-9f4d-7131b7939d4f';
        const chunks = this.inputRegex.source
            .replace(/\\\(/g, leftParen)
            .replace(/\\\)/g, rightParen)
            .split(/[()]/);
        if (chunks.length !== 3) {
            throw new Error(`Expected 3 chunks but got ${JSON.stringify(chunks)}`);
        }
        return chunks.map(c => c.replace(new RegExp(leftParen, 'g'), '\\(').replace(new RegExp(rightParen, 'g'), '\\)'));
    }


    getMatchedHeaderLength(matchedString, headerRegex) {
        if (!headerRegex) {
            return 0;
        }
        const headerMatch = new RegExp(`^${headerRegex}`).exec(matchedString);
        Check.notNull(headerMatch, `Expected '${matchedString}' to match '${headerRegex}'`);
        const headerLength = headerMatch[0].length;
        return headerLength;
    }
}


module.exports = InputFinder;
