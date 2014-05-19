var GLOBAL = "Terminal";
var SRC = [ 'lib/**/*.js' ]

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			release: {
				files: {
					'dist/terminal.js': [ "./index.js" ]
				},
				options: {
					bundleOptions: {
						standalone: "Terminal",
					}
				},
			},
			debug: {
				files: {
					'dist/terminal.dbg.js': [ "./index.js" ]
				},
				options: {
					bundleOptions: {
						standalone: "Terminal",
						debug: true
					}
				},
			},
		},
		uglify: {
			all: {
				files: {
					'dist/terminal.min.js': ['dist/terminal.js']
				}
			}
		},
		mochaTest: {
			all: {
				src: ['test/*.js'],
				options: {
					reporter: 'spec',
					require: ["test/common.js"]
				}
			}
		},
		jshint: {
			all: SRC
		},
		clean: ["dist"]
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['browserify:release', 'uglify']);
	grunt.registerTask('test', ['jshint', 'mochaTest' ]);
	grunt.registerTask('test-browser', ['jshint', 'browserify:debug' ], function() {
		grunt.log.write('Open file://' + __dirname + "/test/index.html in your browser.").ok();
	});
}
