REPORTER = list

BROWSERIFY = ./node_modules/browserify/bin/cmd.js
MOCHA = ./node_modules/.bin/mocha
SRC = lib/ansi.js lib/character.js lib/csi.js lib/osc.js lib/sgr.js lib/term_buffer.js lib/term_diff.js lib/util.js

all: dist/terminal.js

node_modules:
	npm install

dist:
	mkdir dist;

dist/terminal.js: index.js node_modules dist $(SRC)
	$(BROWSERIFY) -s 'terminal'  $< > $@ \
		|| { rm $@; exit 1; }

test:
	$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		$(TESTS)

test-browser: dist/terminal.js
	./node_modules/.bin/serve test/

clean:
	rm -r dist

mrproper: clean
	rm -r node_modules

.PHONY: test test-browser clean mrproper
