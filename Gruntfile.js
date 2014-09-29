/**
 * Gruntfile for 3DAY
 */

'use strict';

// blanketjs used for coverage
require('blanket')({
	// Only files that match the pattern will be instrumented
	pattern: '/',
	'data-cover-never': ['test/', 'node_modules']
});

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({

		license_finder: {
			all: {
				options: {
					production: true
				}
			}
		},

		jshint: {
			// general jshint settings
			all: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: [
					'Gruntfile.js',
					'app.js',
					'models/**/*.js',
					'routes/**/*.js',
					'lib/**/*.js'
				]
			},
			// settings for tests - not much different
			// but they do have more globals for mocha and should
			tests: {
				options: {
					jshintrc: 'test/.jshintrc'
				},
				src: [
					'test/**/*.js'
				]
			}
		},

		// less pre-processor
		less: {
			development: {
				options: {
					paths: ['styles`']
				},
				files: {
					'public/css/main.css': 'styles/main.less'
				}
			},
			production: {
				options: {
					paths: ['styles'],
					yuicompress: true
				},
				files: {
					'public/css/main.css': 'styles/main.less'
				}
			}
		},

		// Configure a mochaTest task
		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['test/**/*.js']
			},

			coverage: {
				options: {
					reporter: 'html-cov',
					// use the quiet flag to suppress the mocha console output
					quiet: true,
					// specify a destination file to capture the mocha
					// output (the quiet option does not suppress this)
					captureFile: 'coverage.html'
				},
				src: ['test/**/*.js']
			}
		},
	});

	// load the plugins required
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-license-finder');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('license', ['license_finder']);

	grunt.registerTask('default', ['lint', 'less', 'test']);

};
