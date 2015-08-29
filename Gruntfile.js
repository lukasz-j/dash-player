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
                    'app/src/jsx_transformed/PlayerViewAll.js': [
                        'app/src/jsx/PlayerView.jsx',
                        'app/src/jsx/DebugInfoPanel.jsx',
                        'app/src/jsx/PlayerControllerPanel.jsx'
                    ]
                }
            }
        },

        connect: {
            server: {
                options: {
                    port: 9001,
                    base: '.'
                }
            }
        },

        jasmine: {
            test: {
                src: 'src/**/*.js',
                options: {
                    specs: 'test/spec/**/*Spec.js',
                    helpers: 'test/helper/*Helper.js',
                    template: require('grunt-template-jasmine-istanbul'),
                    host: 'http://localhost:9001/',
                    templateOptions: {
                        coverage: 'test/coverage/coverage.json',
                        report: 'test/coverage'
                    },
                    vendor: [
                        "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-react');

    grunt.registerTask('default', ['concat', /*'jshint',*/ 'uglify', 'react', 'connect', 'jasmine']);
};