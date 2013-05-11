REPORTER = dot

BROWSERIFY ?= ./node_modules/browserify/bin/cmd.js
MOCHA ?= ./node_modules/.bin/mocha
JSCOVERAGE ?= ./node_modules/.bin/jscoverage

SRC = index.js \
      lib/handler/chr.js \
      lib/handler/csi.js \
      lib/handler/esc.js \
      lib/handler/mode.js \
      lib/handler/sgr.js \
      lib/renderer/plain.js \
      lib/renderer/ansi.js \
      lib/term_buffer.js \
      lib/term_diff.js \
      lib/term_writer.js \
      lib/util.js

# Workaround: include streams2 as long as they are not in browserify
EXTERN = extern/_stream_duplex.js \
         extern/_stream_passthrough.js \
         extern/_stream_readable.js \
         extern/_stream_transform.js \
         extern/_stream_writable.js \
         extern/stream.js

all: dist/terminal.js

dist:
	@echo "MKDIR      $@"
	@mkdir dist;

dist/terminal.js: $(SRC) node_modules dist
	@echo "BROWSERIFY $@"
	@$(BROWSERIFY) -s 'terminal'  $< -o $@ \
		`echo "$(EXTERN)" | tr " " "\n" | sed 's#^\(extern/\(.*\).js\)#-r ./\1:\2#';` \
		|| { rm $@; exit 1; }

dist/terminal-dev.js: $(SRC) node_modules dist
	@echo "BROWSERIFY $@"
	@$(BROWSERIFY) -d -s 'terminal'  $< -o $@ \
		`echo "$(EXTERN)" | tr " " "\n" | sed 's#^\(extern/\(.*\).js\)#-r ./\1:\2#';` \
		|| { rm $@; exit 1; }


test: $(SRC) node_modules dist
	@$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		$(TESTS)

test-browser: node_modules dist/terminal.js
	@echo visit file://$$PWD/test/index.html

coverage: lib-cov dist
	@echo visit file://$$PWD/coverage.html
	@COVERAGE=1 $(MOCHA) \
		--require test/common \
		--reporter html-cov \
		$(TESTS) > coverage.html || true

lib-cov: $(SRC) node_modules
	@echo "JSCOVERAGE $@"
	@$(JSCOVERAGE) lib $@
	@echo "SED        index-cov.js"
	@sed "s#lib/#lib-cov/#" index.js > index-cov.js

clean:
	@echo "RM         dist lib-cov index-cov.js coverage.html"
	@rm -rf dist lib-cov index-cov.js coverage.html || true

mrproper: clean
	@echo "RM         node_modules"
	@rm -rf node_modules || true

.PHONY: test test-browser coverage clean mrproper
