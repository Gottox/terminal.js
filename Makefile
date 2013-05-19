REPORTER = dot

BROWSERIFY ?= ./node_modules/browserify/bin/cmd.js
MOCHA ?= ./node_modules/.bin/mocha
JSCOVERAGE ?= ./node_modules/.bin/jscoverage
JSHINT ?= ./node_modules/.bin/jshint
UGLIFYJS ?= ./node_modules/.bin/uglifyjs

GLOBAL ?= Terminal

SRC = index.js \
      lib/handler/chr.js \
      lib/handler/csi.js \
      lib/handler/dcs.js \
      lib/handler/esc.js \
      lib/handler/mode.js \
      lib/handler/sgr.js \
      lib/input/base.js \
      lib/input/dom.js \
      lib/pty/base.js \
      lib/pty/emitter.js \
      lib/renderer/ansi.js \
      lib/renderer/base.js \
      lib/renderer/dom.js \
      lib/renderer/html.js \
      lib/renderer/live_base.js \
      lib/renderer/plain.js \
      lib/term_buffer.js \
      lib/term_diff.js \
      lib/term_patch.js \
      lib/term_writer.js \
      lib/terminal.js \
      lib/util.js \

# Workaround: include streams2 as long as they are not in browserify
EXTERN = extern/_stream_writable.js \
         extern/stream.js
EXTERN_DUMMY = _stream_passthrough \
	       _stream_readable \
	       _stream_transform \
	       _stream_duplex

all: dist/terminal.min.js

dist:
	@echo "MKDIR      $@"
	@mkdir dist;

dist/terminal.min.js: dist/terminal.js
	@echo "UGLIFYJS   $@"
	@$(UGLIFYJS) $< -c -o $@

dist/terminal.js: $(SRC) node_modules dist
	@echo "BROWSERIFY $@"
	@$(BROWSERIFY) -s $(GLOBAL)  $< -o $@ \
		`echo "$(EXTERN)" | sed 's#\(extern/\([^ ]*\).js\)#-r ./\1:\2#g';` \
		`echo "$(EXTERN_DUMMY)" | sed 's#\([^ ]*\)#-r ./extern/dummy.js:\1#g';` \
		|| { rm $@; exit 1; }


test: lint $(SRC) node_modules dist
	@echo "MOCHA      test"
	@$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		--growl \
		$(TESTS)

test-watch: $(SRC) node_modules dist
	@echo "MOCHA      test"
	@$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		--growl -w\
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

lint: $(SRC)
	@echo "LINT       lib index.js"
	@$(JSHINT) lib index.js
	@echo "LINT       test"
	@$(JSHINT) test/*.js
	@echo "LINT       samples"
	@$(JSHINT) samples/*/*.js

clean:
	@echo "RM         dist lib-cov index-cov.js coverage.html"
	@rm -rf dist lib-cov index-cov.js coverage.html || true

mrproper: clean
	@echo "RM         node_modules"
	@rm -rf node_modules || true

torture: 
	@node samples/ansi_rendering/app.js samples/data/vt100test.txt

.PHONY: test test-browser coverage clean mrproper lint
