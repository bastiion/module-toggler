var inquirer = require('inquirer'),
    optimist = require('optimist'),
    fs = require('fs')
    exec = require('child_process').exec,
    Q = require('q');

var argv = optimist.usage('enable modules, that are linked in anohter dir.\n Usage: $0')
    .demand(['a', 'e'])
    .describe('a', 'Full path to the "available" folder')
    .describe('e', 'Full path to the "enabled" folder')
    .describe('en-cmd', 'Command to enable module (instead of just symlinking)')
    .describe('dis-cmd', 'Command to disable module (instead of just unlinking)')
    .describe('c', 'Command to execute after something was altered')
    .describe('p', 'Prefix added to the link name (p.e. ".conf")').argv;


var availPath = argv.a,
    enabledPath = argv.e,
    prefix = argv.p || '' ,
    lastCommand = argv.c,
    enCommand= argv['en-cmd']
    disCommad = argv['dis-cmd'];

var executeCommand = function(command, def) {    
    if(typeof def === 'undefined')
        def = Q.defer();
    exec(command, function (error, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          def.resolve(true);
      }
    });
    return def;
};

var enableModule = function(target, link) {
    var def = Q.defer();
    fs.symlink(target,link, function(err) {
        if(!err) {
            console.log('successfully enabled module ' + target);
            stateChange = true;
        }
        else console.log(err.message);
        def.resolve(stateChange);
    });
    return def.promise;
};


var disableModule = function(link) {
    var def = Q.defer();
    fs.unlink(link, function(err) {
        if(!err) { 
            console.log('successfully disabled module ' + link);
            stateChange = true;
        }
        else console.log(err.message);
        def.resolve(stateChange);
    });
    return def.promise;
;}



fs.readdir(availPath, function(err, availFiles) {
    fs.readdir(enabledPath, function(err, enabledFiles) {
        var links = {};
        var enabledFileLinkTargets = enabledFiles.map(function(c, i, arr) {
            var link = fs.readlinkSync(enabledPath + c);
            if(! /^\//.test(link)) link = fs.realpathSync(enabledPath + link);
            links[link] = enabledPath + c; 
            return link;
        });
        var choices = availFiles.map(function(c, i, arr) {
            var p = fs.realpathSync(availPath + c);
            return { name: c, checked: enabledFileLinkTargets.indexOf(p) !== -1 }
        });
        inquirer.prompt([{
            name: 'modules',
            type: 'checkbox',
            message: 'Select the modules you want to enable/disable' ,
            choices: choices
            }],            
            function( answers) {
                var proms = [];
                choices.forEach(function(c) {
                    var stateChange = false;
                    if(answers.modules.indexOf(c.name) !== -1) {
                        if(c.checked) return;
                        if(enCommand) {
                            proms.push(executeCommand(enCommand + ' ' + c.name));
                        } else {
                            proms.push(
                                enableModule(availPath + c.name, enabledPath + c.name + prefix)
                            );
                        }
                    } else if(c.checked) {
                        //disable
                        if(disCommad) {
                            proms.push(executeCommand(disCommad  + ' ' + c.name));
                        } else {
                            proms.push(
                                disableModule(links[availPath + c.name])
                            );
                        }
                    }
                });
                Q.all(proms).then(function(values) {
                    if(values.indexOf(true) !== -1 && typeof lastCommand === 'string') {
                    console.log(lastCommand);
                    executeCommand(lastCommand, Q.defer());
                    }
                });
        });
    });
});


