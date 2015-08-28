module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: {
                src: [
                    'src/Player.js',
                    'src/utils/*.js',
                    'src/model/**/*.js',
                    'src/log/*.js',
                    'src/events/*.js',
                    'src/mpd/*.js',
                    'src/streaming/*.js'
                ]
            },
            options: {
                jshintrc: ".jshintrc"
            }
        },

        uglify: {
            minify: {
                files: {
                    'build/dash-player.min.js': [
                        'src/**/*.js'
                    ]
                }
            }
        },

        concat: {
            dist: {
                src: [
                    'src/**/*.js'
                ],
                dest: 'build/dash-player.debug.js'
            }
        },

        react: {
            all: {
                files: {
                    'app/src/js/PlayerViewAll.js': [
                        'app/src/jsx/PlayerView.jsx',
                        'app/src/jsx/DebugInfoPanel.jsx',
                        'app/src/jsx/PlayerControllerPanel.jsx'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-react');

    grunt.registerTask('default', ['concat', 'uglify', 'jshint', 'react']);
};