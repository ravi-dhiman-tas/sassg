module.exports = function(grunt) {
    grunt.initConfig({
        sass: {
            dist: {
                files: [{
                    expand: true,
                    src: ['./sass/*.sass'],
                    dest: './dist',
                    ext: '.css'
                }]
            }
        },
        watch: {
            css: {
                files: '**/*.sass',
                tasks: ['sass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['sass']);
    grunt.registerTask('dist', ['watch']);
}
