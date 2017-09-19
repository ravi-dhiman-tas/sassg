var fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    writeFile = require('write'),
    readFile = require('read-file'),
    MODE_0666 = parseInt('0666', 8),
    MODE_0755 = parseInt('0755', 8),
    EOL = require('os').EOL


/**
 * Generate files
 *
 * @param {Options} options
 * @api public
 */

module.exports = function(options) {
    var configParsed = findUp(options.configFile, process.cwd())

    if(configParsed) {
        readConfigFile(configParsed)
    } else {
        throwError("   This isn't a sass-cli direcotry.")
    }

    function readConfigFile(file_path) {
        try {
            var contents = fs.readFileSync(file_path + '/' + options.configFile, 'utf-8')
            var fileJson = JSON.parse(contents)
            var newPath = file_path + '/' + fileJson.type
            var file_names = options.file_name

            if(!file_names) {
                throw('   Error: no file name specified.')
            }

            var validFileName = new RegExp('variable|module|partial', 'ig')

            if(validFileName.test(file_names)) {
                throwError('   Cannot create component with reserved words: Variable, Module, Partial')
                return
            }

            var newName = "" + file_names + "." + fileJson.type,
                pass1 = write(newPath + '/partials/' + newName, '\// ' + file_names + ' \n')

            if(pass1) {
                write(newPath + '/modules/' + newName, '\// ' + file_names + ' mixins \n')
                write(newPath + '/variables/' + newName, '\// ' + file_names + ' variables \n')
                addContentToFile(file_path + '/' + fileJson.type + '/style.' + fileJson.type, fileJson.type, file_names)
            }
        } catch(e) {
            throwError(e)
        }
        
    }
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
 * Add content to file
 *
 * @param {String} file_path
 * @param {String} type
 * @param {Array} file_names
 * @api public
 */

function addContentToFile(file_path, type, file_names) {
    readFileText(file_path, function(contents, content_path) {
        if( type == 'sass') {
            var newContent = [
                "@import \'.\/variables/" + file_names + "\'",
                "@import \'.\/modules/" + file_names + "\'",
                "@import \'.\/partials/" + file_names + "\'"
            ]
        } else {
            var newContent = [
                "@import \'.\/variables/" + file_names + "\';",
                "@import \'.\/modules/" + file_names + "\';",
                "@import \'.\/partials/" + file_names + "\';"
                
            ]
        }

        if (contents) {
            var originalContent = contents

            if(originalContent[originalContent.length - 1] != EOL) {
                originalContent += EOL
            }

            var varLastIndex = originalContent.lastIndexOf('variable')
            var varIndex = originalContent.indexOf('\n', varLastIndex)
            originalContent = originalContent.slice(0, varIndex) + EOL + newContent[0] + originalContent.slice(varIndex)

            var modLastIndex = originalContent.lastIndexOf('module')
            var modIndex = originalContent.indexOf('\n', modLastIndex)
            originalContent = originalContent.slice(0, modIndex) + EOL + newContent[1] + originalContent.slice(modIndex)

            var partLastIndex = originalContent.lastIndexOf('partial')
            var partIndex = originalContent.indexOf('\n', partLastIndex)
            originalContent = originalContent.slice(0, partIndex) + EOL + newContent[2] + originalContent.slice(partIndex)
        } else {
            originalContent = [
                "// Variables",
                newContent[0],
                "\n\n",
                "// Modules",
                newContent[1],
                "\n\n",
                "// Partials",
                newContent[2]
            ].join('\n')
        }
        writeFile(content_path, originalContent, function(err) {
            if(err) throw err
            console.log()
            console.log('   \x1b[31mmodified\x1b[0m : ' + path.relative(process.cwd(), content_path))
            console.log()
        })
    })
}


/**
 * Read file contents
 *
 * @param {String} file_path
 * @param {Function} cb
 */

function readFileText(file_path, cb) {
    readFile(file_path, {encoding: 'utf8'}, function(err, buffer) {
        if(err) throw err
        return cb(buffer, file_path)
    });
}


/**
 * write
 *
 * @param {String} toPath
 * @param {String} str
 * @param {Number} mode
 */

function write(toPath, str, mode) {
    if(fs.existsSync(toPath)) {
        throwError("   File already exists.")
        return false
    }
    fs.writeFileSync(toPath, str, {
        mode: mode || MODE_0666
    })
    console.log('   \x1b[36mcreate\x1b[0m : ' + path.relative(process.cwd(), toPath))
    return true
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