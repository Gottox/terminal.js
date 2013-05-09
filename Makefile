REPORTER = dot

BROWSERIFY ?= ./node_modules/browserify/bin/cmd.js
MOCHA ?= ./node_modules/.bin/mocha
JSCOVERAGE ?= ./node_modules/.bin/jscoverage

SRC = index.js lib/ansi.js lib/csi.js lib/osc.js lib/sgr.js lib/term_buffer.js lib/term_diff.js lib/util.js

all: dist/terminal.js

dist:
	@echo "MKDIR      $@"
	@mkdir dist;

dist/terminal.js: $(SRC) node_modules dist
	@echo "BROWSERIFY $@"
	@$(BROWSERIFY) -s 'terminal'  $< -o $@ \
		|| { rm $@; exit 1; }

dist/terminal-dev.js: $(SRC) node_modules dist
	@echo "BROWSERIFY $@"
	@$(BROWSERIFY) -d -s 'terminal'  $< -o $@ \
		|| { rm $@; exit 1; }


test: $(SRC) node_modules dist
	@$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		$(TESTS)

test-browser: node_modules dist/terminal.js
	@echo visit http://127.0.0.1:3000/
	@./node_modules/.bin/serve test/

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
