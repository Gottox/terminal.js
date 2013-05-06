REPORTER = list

NPM ?= npm
BROWSERIFY ?= ./node_modules/browserify/bin/cmd.js
MOCHA ?= ./node_modules/.bin/mocha
SRC = index.js lib/ansi.js lib/character.js lib/csi.js lib/osc.js lib/sgr.js lib/term_buffer.js lib/term_diff.js lib/util.js

all: dist/terminal.js

dist:
	mkdir dist;

dist/terminal.js: $(SRC) node_modules dist
	$(BROWSERIFY) -s 'terminal'  $< > $@ \
		|| { rm $@; exit 1; }

test:
	$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		$(TESTS)

test-browser: dist/terminal.js node_modules
	./node_modules/.bin/serve test/

clean:
	rm -r dist || true

mrproper: clean
	rm -r node_modules || true

.PHONY: test test-browser clean mrproper
