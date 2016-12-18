module.exports = {
    cmd: 'jasmine',
    functionMatch: function(output) {
        const errors = [];
        let match;
        const regex = /(?:\d+\) ([^\n]+)[\s\S]+?(?:Message:[\s\n]+([^\n]+))[\s\S]+?Stack[\s\S]*?)?at .*?(\w:[^\n]+?):(\d+):(\d+)\)?/g;
        while (match = regex.exec(output)) {
            let message = match[1];
            if (match[2]) {
                message += '\n' + match[2];
            }
            errors.push({
                file: match[3],
                line: match[4],
                col: match[5],
                message: message,
            });
        }
        return errors;
    },
};
