var fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    MODE_0666 = parseInt('0666', 8),
    MODE_0755 = parseInt('0755', 8)


/**
 * Install & setup application
 *
 * @param {Options} options
 * @api public
 */

module.exports = function(options) {
    var wait = 5

    console.log()

    function complete() {
        if (--wait) return
        var prompt = launchedFromCmd() ? '>' : '$'
        console.log('   Completed!')
        console.log('   %s cd %s && sassg watch', prompt, options.path)
        console.log()
    }

    mkdir(options.path, function () {
        if( options.type ) {
            mkdir(options.path + '/sass', function () {
                mkdir(options.path + '/sass/modules', function () {
                    copyTemplate('sass/modules/_base_module.sass', options.path + '/sass/modules/base.sass')
                    complete()
                })
                mkdir(options.path + '/sass/partials', function () {
                    copyTemplate('sass/partials/_base.sass', options.path + '/sass/partials/base.sass')
                    complete()
                })
                mkdir(options.path + '/sass/variables', function () {
                    switch(options.unit) {
                        case 'rem':
                            copyTemplate('sass/variables/_base_var_rem.sass', options.path + '/sass/variables/base.sass')
                            break
                        case 'em':
                            copyTemplate('sass/variables/_base_var_em.sass', options.path + '/sass/variables/base.sass')
                            break
                        default:
                            copyTemplate('sass/variables/_base_var_px.sass', options.path + '/sass/variables/base.sass')
                            break
                    }
                    complete()
                })
                copyTemplate('sass/style.sass', options.path + '/sass/style.sass')
                complete()
            })
        } else {
            mkdir(options.path + '/scss', function () {
                mkdir(options.path + '/scss/modules', function () {
                    copyTemplate('scss/modules/_base_module.scss', options.path + '/scss/modules/base.scss')
                    complete()
                })
                mkdir(options.path + '/scss/partials', function () {
                    copyTemplate('scss/partials/_base.scss', options.path + '/scss/partials/base.scss')
                    complete()
                })
                mkdir(options.path + '/scss/variables', function () {
                    switch(options.unit) {
                        case 'rem':
                            copyTemplate('scss/variables/_base_var_rem.scss', options.path + '/scss/variables/base.scss')
                            break
                        case 'em':
                            copyTemplate('scss/variables/_base_var_em.scss', options.path + '/scss/variables/base.scss')
                            break
                        default:
                            copyTemplate('scss/variables/_base_var_px.scss', options.path + '/scss/variables/base.scss')
                            break
                    }
                    complete()
                })
                copyTemplate('scss/style.scss', options.path + '/scss/style.scss')
                complete()
            })
        }
        complete()
    })

    var config = {
        name: options.name,
        version: options.version,
        src: options.path,
        dist: './dist/',
        type: options.type
    }

    write(options.path + '/' + options.configFile, JSON.stringify(config, null, 2) + '\n')
}


/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir(path, fn) {
    mkdirp(path, MODE_0755, function (err) {
        if (err) throw err
        console.log('   \x1b[36mcreate\x1b[0m : ' + path)
        fn && fn()
    })
}


/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write(toPath, str, mode) {
    fs.writeFileSync(toPath, str, {
        mode: mode || MODE_0666
    })
    console.log('   \x1b[36mcreate\x1b[0m : ' + path.relative(process.cwd(), toPath))
}


/**
 * Copy file from template directory.
 */

function copyTemplate(from, to) {
    from = path.join(__dirname, '..', 'templates', from)
    write(to, fs.readFileSync(from, 'utf-8'))
}


/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd() {
    return process.platform === 'win32' &&
        process.env._ === undefined
}