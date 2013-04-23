REPORTER = dot

BROWSERIFY = ./node_modules/browserify/bin/cmd.js
MOCHA = ./node_modules/.bin/mocha

all: build build-dev

build:
	mkdir -p dist
	$(BROWSERIFY) \
		 lib/browserify-terminal.js > dist/terminal.js

build-dev:
	mkdir -p dist
	$(BROWSERIFY) \
		-d \
		lib/browserify-terminal.js > dist/terminal-dev.js

test:
	$(MOCHA) \
		--require test/common \
		--reporter $(REPORTER) \
		$(TESTS)

test-browser: build-dev
	./node_modules/.bin/serve test/

clean:
	rm -r dist

.PHONY: test test-browser clean
