var assert = require('assert')
var exec = require('child_process').exec
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var rimraf = require('rimraf')
var spawn = require('child_process').spawn

var PKG_PATH = path.resolve(__dirname, '..', 'package.json')
var BIN_PATH = path.resolve(path.dirname(PKG_PATH), require(PKG_PATH).bin.sassg)
var TEMP_DIR = path.resolve(__dirname, '..', 'temp', String(process.pid + Math.random()))

describe('sass(1)', function () {
    before(function (done) {
        this.timeout(30000)
        cleanup(done)
    })

    after(function (done) {
        this.timeout(30000)
        cleanup(done)
    })

    describe('(no args)', function () {
        var ctx = setupTestEnvironment(this.fullTitle())

        it('should create basic app', function (done) {
            runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
                if (err) return done(err)
                ctx.files = parseCreatedFiles(stdout, ctx.dir)
                ctx.stderr = stderr
                ctx.stdout = stdout
                assert.equal(ctx.files.length, 12)
                done()
            })
        })

        it('should have basic files', function() {
            assert.notEqual(ctx.files.indexOf('package.json'), -1)
            assert.notEqual(ctx.files.indexOf('sassg.json'), -1)
            assert.notEqual(ctx.files.indexOf('Gruntfile.js'), -1)
        })

        it('should have scss templates', function() {
            assert.notEqual(ctx.files.indexOf('scss/modules/_base.scss'), -1)
            assert.notEqual(ctx.files.indexOf('scss/partials/_base.scss'), -1)
            assert.notEqual(ctx.files.indexOf('scss/variables/_base_var.scss'), -1)
        })

        it('should have a package.json file', function() {
            var file = path.resolve(ctx.dir, 'package.json')
            var contents = fs.readFileSync(file, 'utf8')
            assert.equal(contents, '{\n' +
                '  "name": "sass(1)-(no-args)",\n' +
                '  "version": "0.0.0",\n' +
                '  "private": true,\n' +
                '  "scripts": {\n' +
                '    "start": ""\n' +
                '  },\n' +
                '  "dependencies": {\n' +
                '    "grunt": "~0.4.5",\n' +
                '    "grunt-cli": "~1.2.0",\n' +
                '    "grunt-contrib-sass": "~1.0.0",\n' +
                '    "grunt-contrib-watch": "~1.0.0"\n' +
                '  }\n' +
                '}\n')
        })

        it('should have a sassg.json file', function() {
            var file = path.resolve(ctx.dir, 'sassg.json')
            var contents = fs.readFileSync(file, 'utf8')
            assert.equal(contents, '{\n' +
                '  "name": "sass(1)-(no-args)",\n' +
                '  "cli_version": "1.0.0",\n' +
                '  "path": ".",\n' +
                '  "type": "scss"\n' +
                '}\n')
        })

    })

    describe('(unknown args)', function () {
        var ctx = setupTestEnvironment(this.fullTitle())

        it('should exit with code 1', function (done) {
            runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
                if (err) return done(err)
                assert.strictEqual(code, 1)
                done()
            })
        })

        it('should print usage', function (done) {
            runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
                if (err) return done(err)
                assert.ok(/Usage: sass/.test(stdout))
                assert.ok(/--help/.test(stdout))
                assert.ok(/--version/.test(stdout))
                assert.ok(/error: unknown option/.test(stderr))
                done()
            })
        })

        it('should print unknown option', function (done) {
            runRaw(ctx.dir, ['--foo'], function (err, code, stdout, stderr) {
                if (err) return done(err)
                assert.ok(/error: unknown option/.test(stderr))
                done()
            })
        })
    })

    describe('--sass', function() {
        describe('(not specified)', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should create basic app with scss stylesheet', function (done) {
                runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
                    if (err) return done(err)
                    ctx.files = parseCreatedFiles(stdout, ctx.dir)
                    ctx.stderr = stderr
                    ctx.stdout = stdout
                    assert.equal(ctx.files.length, 12)
                    done()
                })
            })
        })
        describe('(specified)', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should create basic app with sass stylesheet', function (done) {
                runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
                    if (err) return done(err)
                    ctx.files = parseCreatedFiles(stdout, ctx.dir)
                    ctx.stderr = stderr
                    ctx.stdout = stdout
                    assert.equal(ctx.files.length, 12)
                    done()
                })
            })
        })
    })

    describe('g', function() {
        describe('(no file name)[g]', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should exit with code 1', function(done) {
                runRaw(ctx.dir, ['g'], function(err, code, stdout, stderr) {
                    assert.strictEqual(code, 1)
                    done()
                })
            })
        })

        describe('(no sass-cli.json)[g][foo]', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should exit with code 1', function(done) {
                runRaw(ctx.dir, ['g', 'foo'], function(err, code, stdout, stderr) {
                    assert.strictEqual(code, 1)
                    done()
                })
            })
        })

        describe('(foo)', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should create basic app', function (done) {
                runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
                    if (err) return done(err)
                    ctx.files = parseCreatedFiles(stdout, ctx.dir)
                    ctx.stderr = stderr
                    ctx.stdout = stdout
                    assert.equal(ctx.files.length, 12)
                    done()
                })
            })

            it('should generate foo component', function (done) {
                runRaw(ctx.dir, ['g', 'foo'], function (err, code, stdout, stderr) {
                    if (err) return done(err)
                    assert.ok(/foo.scss/.test(stdout))
                    assert.ok(/style.scss/.test(stdout))
                    done()
                })
            })
        })
    })

    describe('generate', function() {
        describe('(no file name)[generate]', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should exit with code 1', function(done) {
                runRaw(ctx.dir, ['generate'], function(err, code, stdout, stderr) {
                    assert.strictEqual(code, 1)
                    done()
                })
            })
        })

        describe('(no sass-cli.json)[generate][foo]', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should exit with code 1', function(done) {
                runRaw(ctx.dir, ['g', 'foo'], function(err, code, stdout, stderr) {
                    assert.strictEqual(code, 1)
                    done()
                })
            })
        })

        describe('(foo)', function() {
            var ctx = setupTestEnvironment(this.fullTitle())

            it('should create basic app', function (done) {
                runRaw(ctx.dir, [], function (err, code, stdout, stderr) {
                    if (err) return done(err)
                    ctx.files = parseCreatedFiles(stdout, ctx.dir)
                    ctx.stderr = stderr
                    ctx.stdout = stdout
                    assert.equal(ctx.files.length, 12)
                    done()
                })
            })

            it('should generate foo component', function (done) {
                runRaw(ctx.dir, ['g', 'foo'], function (err, code, stdout, stderr) {
                    if (err) return done(err)
                    assert.ok(/foo.scss/.test(stdout))
                    assert.ok(/style.scss/.test(stdout))
                    done()
                })
            })
        })
    })

    describe('-h', function() {
        var ctx = setupTestEnvironment(this.fullTitle())

        it('should print usage', function (done) {
            run(ctx.dir, ['-h'], function (err, stdout) {
                if (err) return done(err)
                var files = parseCreatedFiles(stdout, ctx.dir)
                assert.equal(files.length, 0)
                assert.ok(/Usage: sass/.test(stdout))
                assert.ok(/--help/.test(stdout))
                assert.ok(/--version/.test(stdout))
                done()
            })
        })
    })

    describe('--help', function() {
        var ctx = setupTestEnvironment(this.fullTitle())

        it('should print usage', function (done) {
            run(ctx.dir, ['--help'], function (err, stdout) {
                if (err) return done(err)
                var files = parseCreatedFiles(stdout, ctx.dir)
                assert.equal(files.length, 0)
                assert.ok(/Usage: sass/.test(stdout))
                assert.ok(/--help/.test(stdout))
                assert.ok(/--version/.test(stdout))
                done()
            })
        })
    })
})

function cleanup(dir, callback) {
    if (typeof dir === 'function') {
        callback = dir
        dir = TEMP_DIR
    }

    rimraf(dir, function (err) {
        callback(err)
    })
}

function childEnvironment() {
    var env = Object.create(null)

    // copy the environment except for npm veriables
    for (var key in process.env) {
        if (key.substr(0, 4) !== 'npm_') {
            env[key] = process.env[key]
        }
    }

    return env
}

function npmInstall(dir, callback) {
    var env = childEnvironment()

    exec('npm install', {
        cwd: dir,
        env: env
    }, function (err, stderr) {
        if (err) {
            err.message += stderr
            callback(err)
            return
        }

        callback()
    })
}

function parseCreatedFiles(output, dir) {
    var files = []
    var lines = output.split(/[\r\n]+/)
    var match

    for (var i = 0; i < lines.length; i++) {
        if ((match = /create.*?: (.*)$/.exec(lines[i]))) {
            var file = match[1]

            if (dir) {
                file = path.resolve(dir, file)
                file = path.relative(dir, file)
            }

            file = file.replace(/\\/g, '/')
            files.push(file)
        }
    }

    return files
}

function run(dir, args, callback) {
    runRaw(dir, args, function (err, code, stdout, stderr) {
        if (err) {
            return callback(err)
        }

        process.stderr.write(stripWarnings(stderr))

        try {
            assert.equal(stripWarnings(stderr), '')
            assert.strictEqual(code, 0)
        } catch (e) {
            return callback(e)
        }

        callback(null, stripColors(stdout))
    })
}

function runRaw(dir, args, callback) {
    var argv = [BIN_PATH].concat(args)
    var exec = process.argv[0]
    var stderr = ''
    var stdout = ''

    var child = spawn(exec, argv, {
        cwd: dir
    })

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', function ondata(str) {
        stdout += str
    })
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', function ondata(str) {
        stderr += str
    })

    child.on('close', onclose)
    child.on('error', callback)

    function onclose(code) {
        callback(null, code, stdout, stderr)
    }
}

function setupTestEnvironment(name) {
    var ctx = {}

    before('create environment', function (done) {
        ctx.dir = path.join(TEMP_DIR, name.replace(/[<>]/g, ''))
        mkdirp(ctx.dir, done)
    })

    after('cleanup environment', function (done) {
        this.timeout(30000)
        cleanup(ctx.dir, done)
    })

    return ctx
}

function stripColors(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[(\d+)m/g, '_color_$1_')
}

function stripWarnings(str) {
    return str.replace(/\n(?:\x20{2}warning: [^\n]+\n)+\n/g, '')
}