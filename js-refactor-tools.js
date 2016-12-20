const minimist = require('minimist');
const vinylFs = require('vinyl-fs');
const Project = require('./src/Project');
const Options = require('./src/Options');
const RefactorFactory = require('./src/RefactorFactory');

function asArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    return [value];
}

function cliMain(procArgs) {
    const args = minimist(procArgs);
    const srcs = asArray(args.src);

    const sources = vinylFs.src(srcs);

    const project = new Project();
    const options = new Options();
    options.set('sourceFile', 'src/refactors/NodePaths.js');
    options.set('targetFile', 'src/NodePaths.js');
    project.setOptions(options);
    project.addFilesStream(sources)
        .then(() => {
            console.log(project.files[0].basename);
            const refactor = new RefactorFactory().create('move');
            console.log(refactor.getEdit(project));
            // console.log(project.files);
        })
        .catch(e => console.log(e));
}

cliMain(process.argv);
