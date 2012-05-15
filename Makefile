REPORTER = dot

BROWSERBUILD = ./node_modules/.bin/browserbuild
MOCHA = ./node_modules/.bin/mocha

all: build build-dev

build:
	mkdir -p dist
	$(BROWSERBUILD) \
		-g terminal \
		-m terminal -b lib/ \
		lib/*js > dist/terminal.js

build-dev:
	mkdir -p dist
	$(BROWSERBUILD) \
		-g terminal \
		-d -m terminal -b lib/ \
		lib/*js > dist/terminal-dev.js

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
