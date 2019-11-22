pico-gltest
===========

[![Build Status](https://travis-ci.com/tsherif/pico-gltest.svg?branch=master)](https://travis-ci.com/tsherif/pico-gltest) [![Coverage Status](https://coveralls.io/repos/github/tsherif/pico-gltest/badge.svg?branch=master)](https://coveralls.io/github/tsherif/pico-gltest?branch=master) [![License](https://img.shields.io/github/license/tsherif/pico-gltest.svg)](https://github.com/tsherif/pico-gltest/blob/master/LICENSE) [![NPM](https://img.shields.io/npm/v/pico-gltest.svg)](https://www.npmjs.com/package/pico-gltest)

pico-gltest is a testing framework focused on WebGL applications with an API is inspired by [tape](), but with additional conveniences relevant to testing WebGL. It's designed to run in a browser without any build steps, making it straightforward to use across browsers and platforms. It uses puppeteer to run headlessly via the command line, making ideal for automated testing of both WebGL 1 and 2 applications. A slimple test suite using pico-gltest might look like the following:

```js

glTest("Test myApp", (t, canvas) => {
    const gl = canvas.createContext("webgl2");

    gl.enable(gl.DEPTH_TEST);
    t.glParameterEqual(gl, gl.DEPTH_TEST, true, "Depth test enabled");
    t.glParameterNotEqual(gl, gl.DEPTH_TEST, false, "Depth test not disabled");

    // Buffer tests are WebGL 2-only
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_READ);
    t.bufferEqual(gl, gl.ARRAY_BUFFER, [1, 2, 3, 4], "Buffer data counts up");
    t.bufferNotEqual(gl, gl.ARRAY_BUFFER, [4, 3, 2, 1], "Buffer data does not count down");

    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    t.pixelEqual(gl, [255, 0, 0, 255], "Framebuffer is red");
    t.pixelNotEqual(gl, [0, 0, 255, 255], "Framebuffer is not blue");

    t.done();
});

```

## Usage

### Installation

To install, simply run:

```bash
npm i -D pico-gltest
```

### Running

Assuming tests are in a file `test.js`, the can be run as follows:

```bash
npx gltest test.js
```

By default, `gltest` will read configuration from `gltest.config.js`, from which it will read the following options:

- **tests** (default: `[]`): List of tests to run.
- **outputDir** (default: `"gltest-results/"`): Directory to output results into. This will be run by puppeteer, but can also simply be opened in a browser. 
- **serverPort** (default: `7171`): Port to run the local server on for puppeteer testing.
- **headless** (default: `true`): Whether to run headless.
- **assetDir** (default: `null`): Directory to load assets from. Contents from this directory will be available to tests in the subdirectory `assets/`.
- **coverage** (default: `false`): Whether to produce coverage results that are consumable by [Istanbul](https://istanbul.js.org/).
- **coverageExcludeFiles** (default: `[]`): Files to exclude from coverage results. This can be useful for excluding utility or library files from coverage reports. Note that files in **tests** are always excluded from coverage reports.

Full `gltest` command line usage is as follows:

```bash
gltest [--help] [--version] [--config PATH] [--coverage {true/false}] [--headless {true/false}] [--server-port PORT] [--output-dir PATH] [--asset-dir PATH] [TEST FILES...]
```

Command line arguments will always override options from the config file:
- **--help**: Show a help message and exit.
- **--version**: Show version number and exit.
- **--config**: Path to config file (default: ./gltest.config.json)
- **--output-dir** (default: `"gltest-results/"`): Directory to output results into. This will be run by puppeteer, but can also simply be opened in a browser. 
- **--server-port** (default: `7171`): Port to run the local server on for puppeteer testing.
- **--headless** (default: `true`): Whether to run headless.
- **--coverage** (default: `false`): Whether to produce coverage results that are consumable by [Istanbul](https://istanbul.js.org/).
- **--asset-dir** (default: `null`): Directory to load assets from. Contents from this directory will be available to tests in the subdirectory `assets/`.


### Writing Tests

Tests are defined for `pico-gltest` using the `glTest` function. The general structure is as follows:

```js

glTest("My test", (t, canvas) => {

    // Write some tests

    t.done();
});

```

The arguments to the test function are a tester object (described below) and a DOM canvas element. Each test will create a fresh canvas for testing and tear it down afterwards. 

Test functions can also be async: 

```js

glTest("My test", async (t, canvas) => {

    const data = await getAsyncData();

    // Write some tests

    t.done();
});
```

A single test can also be selected to run on its own using `glTest.only`:


```js

glTest.only("Test I'm writing now", (t, canvas) => {

    // Write some tests

    t.done();
});
```

The tester object exposes the following basic assertions:
- `t.ok(actual, message)`: Check the truthiness of `actual`.
- `t.noOk(actual, message)`: Check the falsiness of `actual`.
- `t.equal(actual, expected, message)`: Check the `actual` and `expected` are shallowly equal.
- `t.notEqual(actual, expected, message)`: Check the `actual` and `expected` are not shallowly equal.
- `t.deepEqual(actual, expected, message)`: Check the `actual` and `expected` are deeply equal (e.g. for objects and arrays).
- `t.notDeepEqual(actual, expected, message)`: Check the `actual` and `expected` are not deeply equal (e.g. for objects and arrays).
- `t.throws(fn, message)`: Check the that `fn` throws an exception.
- `t.doesNotThrow(fn, message)`: Check that `fn` does not throw an exception.

```js
glTest("Basic assertions", (t, canvas) => {
    t.ok(true, "ok");
    t.equal(1, 1, "equal");
    t.deepEqual({a: 1, b: 2}, {a: 1, b: 2}, "deepEqual");

    // deepEqual considers all array types equivalent
    t.deepEqual([1, 2, 3, 4], new Float32Array([1, 2, 3, 4]), "deepEqual");

    t.throws(() => {throw "Throw";}, "throws");

    t.done();
});
```

The tester object exposes also exposes WebGL-specific assertions:
- `glParameterEqual(gl, parameter, expected, message)`: Check if the WebGL `parameter` (passed to `gl.getParameter`) matches `expected`. 
- `glParameterNotEqual(gl, parameter, expected, message)`: Check if the WebGL `parameter` (passed to `gl.getParameter`) matches `expected`. 
- `pixelEqual(gl,[ uv=[0.5, 0.5],] expected, message)`: Check if the currently bound framebuffer has the value `expected` at the location indicated by `uv`. `uv` is a two-element array indicating with `[0, 0]` indicating the bottom-left of the canvas, and `[1, 1]` indicating the top-right.
- `pixelNotEqual(gl,[ uv=[0.5, 0.5],] expected, message)`: Check if the currently bound framebuffer does not have the value `expected` at the location indicated by `uv`. `uv` is a two-element array indicating with `[0, 0]` indicating the bottom-left of the canvas, and `[1, 1]` indicating the top-right.
- `bufferEqual(gl,[ binding=gl.ARRAY_BUFFER,] expected, message)` (WebGL 2-only): Check if the buffer bound to `binding` contains the values in `expected`. Matching will be done based on the array type of `expected` and will default to `Float32Array`.
- `bufferNotEqual(gl,[ binding=gl.ARRAY_BUFFER,] expected, message)` (WebGL 2-only): Check if the buffer bound to `binding` contains the values in `expected`. Matching will be done based on the array type of `expected` and will default to `Float32Array`.

```js
glTest("GL assertions", (t, canvas) => {
    const gl = canvas.getContext("webgl2");

    t.glParameterEqual(gl, gl.DEPTH_TEST, true, "glParameterEqual primitive");
    t.glParameterEqual(gl, gl.VIEWPORT, [10, 20, 30, 40], "glParameterEqual array");

    const floatBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floatBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_READ);
    t.bufferEqual(gl, gl.ARRAY_BUFFER, [1, 2, 3, 4], "bufferEqual");

    const byteBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, byteBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([5, 6, 7, 8]), gl.STATIC_READ);

    // bufferEqual will respect the type of the "expected" array passed
    t.bufferEqual(gl, gl.ARRAY_BUFFER, new Uint8Array([5, 6, 7, 8]), "bufferEqual bytes");

    t.done();
});
```

Finally, tester object expose the async helper `loopUntil` with WebGL usages that require asynchrony:
- `loopUntil(fn)`: Returns a promise that will resolve when `fn` returns true.

```js
glTest("GL assertions", (t, canvas) => {
    const gl = canvas.getContext("webgl2");
    const query = gl.createQuery();

    gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE, query);
    // ...
    gl.endQuery(query);

    await t.loopUntil(() => gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE));

    t.equal(gl.getQueryParameter(this.query, GL.QUERY_RESULT), expected, "Query results");

    t.done();
});
```
