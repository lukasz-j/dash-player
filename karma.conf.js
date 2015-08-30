module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '.',

        // frameworks to use
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'test/lib/jquery-1.11.3.min.js',

            'src/**/*.js',

            'test/helper/*.js',
            'test/spec/events/*.js',
            'test/spec/utils/*.js',
            'test/spec/mpd/*.js',

            {pattern: 'test/resources/mpd/*.mpd', watched: true, included: false, served: true},
            {pattern: 'test/resources/binary-files/*.mp4', watched: true, included: false, served: true}
        ],

        // list of files to exclude
        exclude: [],

        // test results reporter to use
        reporters: ['progress', 'coverage'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/**/*.js': ['coverage']
        },

        // optionally, configure the reporter
        coverageReporter: {
            type: 'html',
            dir: 'test/coverage/',
            includeAllSources: true,
            instrumenterOptions: {
                istanbul: {noCompact: true}
            }
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};