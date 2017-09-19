var fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    sass = require('node-sass'),
    watchman = require('watch')



module.exports = function(options) {

    var configParsed = findUp(options.configFile, process.cwd())

    if(!configParsed) {
        throwError("   This isn't a sass-cli direcotry.")
    }

    var contents = fs.readFileSync(configParsed + '/' + options.configFile, 'utf-8'),
        config = JSON.parse(contents)
        outputFile = path.join(configParsed, 'dist/' + config.name + '.' + config.type),
        inputFile = configParsed + '/' + config.type + '/style.' + config.type

    if(config.dist) {
        if(config.dist.lastIndexOf('/') != -1) {
            outputFile = path.join(configParsed, config.dist + config.name + '.' + config.type)
        } else {
            outputFile = path.join(configParsed, config.dist + '/' + config.name + '.' + config.type)
        }
    }

    console.log(outputFile)

    watchman.createMonitor(configParsed + '/' + config.type, function(mon) {
        mon.files[configParsed + '/' + config.type + '/.' + config.type]

        mon.on('created', function(f, stat) {
            console.log('created', inputFile, stat)
            var result = sass.renderSync({
                file: inputFile,
                outFile: outputFile,
                sourceMap: true
            });
            
            console.log(result.css);
            console.log(result.map);
            console.log(result.stats);
        })
        mon.on('changed', function(f, stat) {
            console.log('changed', f, stat)
            try {
                var result = sass.renderSync({
                    file: inputFile,
                    outFile: outputFile,
                    sourceMap: true
                });
                
                console.log(result.css);
                console.log(result.map);
                console.log(result.stats);
            } catch(e) {
                throwError(e);
            }
        })
        mon.on('removed', function(f, stat) {
            console.log('removed', inputFile, stat)
            var result = sass.renderSync({
                file: inputFile,
                outFile: outputFile,
                sourceMap: true
            });
            
            console.log(result.css);
            console.log(result.map);
            console.log(result.stats);
        })
        // mon.stop();
    })

}


/**
 * Find up
 *
 * @param {String} name
 * @param {String} from
 * @api public
 */

function findUp(name, from) {
    if(!Array.isArray(name)) {
        name = [name]
    }

    var root = path.parse(from).root
    var currentDir = from

    while(currentDir && currentDir !== root) {
        for(var i = 0; i < name.length; i++) {
            var p = path.join(currentDir, name[i])
            if(fs.existsSync(p)) {
                return currentDir
            }
        }

        var nodeModule = path.join(currentDir, 'node_modules')
        if(fs.existsSync(nodeModule)) {
            return null
        }
        currentDir = path.dirname(currentDir)
    }

    return null
}


/**
 * Global error config
 *
 * @param {Error} e
 */

function throwError(e) {
    console.error()
    console.error('\x1b[31m' + e + '\x1b[0m')
    console.error()
    process.exit(1)
}