var exec = require('child_process').exec
packageManager = 'npm'
console.log(process.cwd())
exec(`${packageManager} link sass-cli`, function(err) {
    if (err) throw(err)
})