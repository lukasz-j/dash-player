module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            minify: {
                files: {
                    'build/dash-player.min.js': [
                        'src/Dash.js',
                        'src/Player.js',
                        'src/utils/*.js',
                        'src/model/**/*.js',
                        'src/log/*.js',
                        'src/events/*.js',
                        'src/mpd/*.js',
                        'src/streaming/*.js'
                    ]
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'src/Dash.js',
                    'src/Player.js',
                    'src/utils/*.js',
                    'src/model/**/*.js',
                    'src/log/*.js',
                    'src/events/*.js',
                    'src/mpd/*.js',
                    'src/streaming/*.js'
                ],

                dest: 'build/dash-player.debug.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'concat']);
};