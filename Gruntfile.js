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
                    'src/streaming/*.js',
                    'src/adaptation/*.js',
                    'src/sync/*.js'
                ]
            },
            options: {
                jshintrc: ".jshintrc",
                reporterOutput: ""
            }
        },

        react: {
            all: {
                files: {
                    'app/src/jsx_transformed/PlayerViewAll.js': [
                        'app/src/jsx/PlayerView.jsx',
                        'app/src/jsx/DebugInfoPanel.jsx',
                        'app/src/jsx/PlayerControllerPanel.jsx',
                        'app/src/jsx/AdaptationViews.jsx'
                    ]
                }
            }
        },

        uglify: {
            minify: {
                files: {
                    'build/dash-player.min.js': [
                        'src/**/*.js'
                    ],
                    'app/src/jsx_transformed/PlayerViewAll.min.js': [
                        'app/src/jsx_transformed/PlayerViewAll.js'
                    ]
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                expand: true,
                cwd: 'app/src/css',
                src: ['*.css', '!*.min.css'],
                dest: 'build',
                ext: '.min.css'
            }]
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

        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        replace: {
            index: {
              // replace timestamp placeholders with current timestamp to
              // override expiration-cache on production servers
              src: 'app/prod/index.base.html',
              dest: 'app/prod/index.html',
              replacements: [{
                from: '{currentts}',
                to: function (matchedWord) {
                  return Math.floor(Date.now() / 1000);
                }
              },{
                from: '{jsvariant}',
                to: function (matchedWord) {
                  return grunt.option('jsdebug') ? 'debug' : 'min';
                }
              }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('no-jshint', ['react', 'concat', 'uglify', 'cssmin', 'replace']);
    grunt.registerTask('no-test', ['jshint', 'no-jshint']);
    grunt.registerTask('default', ['no-test', 'karma']);
};
