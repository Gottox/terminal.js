var GLOBAL = "Terminal";
var SRC = [ 'lib/**/*.js' ]

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			all: {
				files: {
					'dist/terminal.js': SRC
				},
			}
		},
		uglify: {
			all: {
				files: {
					'dist/terminal.min.js': ['dist/terminal.js']
				}
			}
		},
		mochacov: {
			coverage: {
				src: ['test/*.js'],
				options: {
					reporter: "html-cov",
					require: ["test/common.js"]
				}
			},
			test: {
				src: ['test/*.js'],
				options: {
					reporter: 'spec',
					require: ["test/common.js"]
				}
			}
		},
		jshint: {
			all: SRC
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-mocha-cov');

	grunt.registerTask('default', ['browserify', 'uglify']);
	grunt.registerTask('test', ['jshint', 'mochacov:test' ]);
	grunt.registerTask('coverage', ['mochacov:coverage']);
}
