var SRC = [
	"index.js",
	"./lib/handler/chr.js",
	"./lib/handler/csi.js",
	"./lib/handler/dcs.js",
	"./lib/handler/esc.js",
	"./lib/handler/mode.js",
	"./lib/handler/osc.js",
	"./lib/handler/sgr.js",
	"./lib/input/base.js",
	"./lib/input/dom.js",
	"./lib/input/tty.js",
	"./lib/output/ansi.js",
	"./lib/output/base.js",
	"./lib/output/dom.js",
	"./lib/output/html.js",
	"./lib/output/live_base.js",
	"./lib/output/plain.js",
	"./lib/output/tty.js",
	"./lib/source/base.js",
	"./lib/source/emitter.js",
	"./lib/term_buffer.js",
	"./lib/term_diff.js",
	"./lib/term_writer.js",
	"./lib/terminal.js",
	"./lib/util.js"
];

var GLOBAL = "Terminal";

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			dist: {
				files: {
					'dist/terminal.js': SRC
				},
			}
		},
		uglify: {
			mindist: {
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
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-mocha-cov');

	grunt.registerTask('default', ['browserify', 'uglify']);
	grunt.registerTask('test', ['mochacov:test']);
	grunt.registerTask('coverage', ['mochacov:coverage']);


}
