glcheck
=======

[![Build Status](https://travis-ci.com/tsherif/glcheck.svg?branch=master)](https://travis-ci.com/tsherif/glcheck) [![Coverage Status](https://img.shields.io/coveralls/github/tsherif/glcheck)](https://coveralls.io/github/tsherif/glcheck?branch=master) [![License](https://img.shields.io/github/license/tsherif/glcheck.svg)](https://github.com/tsherif/glcheck/blob/master/LICENSE) [![NPM](https://img.shields.io/npm/v/glcheck.svg)](https://www.npmjs.com/package/glcheck)

**glcheck** is a WebGL-focused testing framework. It runs unit tests and render tests using puppeteer which allows it to run automated tests and generate coverage reports for both WebGL 1 and 2 applications.

# Usage

To install, simply run:

```bash
npm i -D glcheck
```

Run using:

```bash
npx glcheck
``` 

By default, `glcheck` will read configuration from `glcheck.config.json` in the current directory, from which it will read the following options:

- **unitTests** (default: `[]`): List of JavaScript files to run as unit tests.
- **unitTestDir** (default: `"glcheck-tests/unit-tests/"`): Directory to output unit test results into. This includes an HTML page that will be run by puppeteer, but it can also simply be opened in a browser. 
- **assetDir** (default: `null`): Directory to load assets from. Contents from this directory will be available to unit tests in the subdirectory `assets/`.
- **renderTests** (default: `[]`): List of HTML files to run as render tests.
- **referenceImageDir** (default: `"glcheck-tests/reference-images/"`): Directory containing render test reference images.
- **renderTestThreshold** (default: `0.99`): Match threshold between 0 and 1 for render tests.
- **renderTimeout** (default: `5000`): Timeout for each render test in milliseconds.
- **saveRenderFailures** (default: `false`): Whether to save render failure and diff images for render tests.
- **renderFailureDir** (default: `"glcheck-tests/render-failures/"`): Where to save render failure and diff images for render tests.
- **serverPort** (default: `7171`): Port to run the local server on for puppeteer.
- **headless** (default: `true`): Whether to run headless.
- **coverage** (default: `false`): Whether to generate coverage results that are consumable by [Istanbul](https://istanbul.js.org/).
- **coverageExcludeFiles** (default: `[]`): Files to exclude from coverage results. This can be useful for excluding utility or library files from coverage reports. Note that files in **unitTests** are always excluded from coverage reports.
- **only** (default: `null`): Only run the provided test file (can be a glob pattern to run multiple files).

Full `glcheck` command line usage is as follows:

```bash
glcheck [--help] [--version] [--config PATH] [--unit-test-dir PATH] [--asset-dir PATH] [--reference-image-dir PATH] [--render-test-threshold VAL] [--render-timeout TIME] [--save-render-failures {true/false}] [--render-failure-dir PATH] [--server-port PORT] [--coverage {true/false}] [--headless {true/false}] [--only PATH]
```

Command line arguments will always override options from the config file:
- **--help**: Show a help message and exit.
- **--version**: Show version number and exit.
- **--config** (default: `"glcheck.config.json"`): Path to config file.
- **--unit-test-dir** (default: `"glcheck-results/"`): Directory to output unit test results into. This includes an HTML page that will be run by puppeteer, but it can also simply be opened in a browser.
- **--asset-dir** (default: `null`): Directory to load assets from. Contents from this directory will be available to unit tests in the subdirectory `assets/`.
- **--reference-image-dir** (default: `"glcheck-tests/reference-images/"`): Directory containing render test reference images.
- **--render-test-threshold** (default: `0.99`): Match threshold between 0 and 1 for render tests.
- **--render-timeout** (default: `5000`): Timeout for each render test in milliseconds.
- **--save-render-failures** (default: `false`): Whether to save render failure and diff images for render tests.
- **--render-failure-dir** (default: `"glcheck-tests/render-failures/"`): Where to save render failure and diff images for render tests.
- **--server-port** (default: `7171`): Port to run the local server on for puppeteer.
- **--headless** (default: `true`): Whether to run headless.
- **--coverage** (default: `false`): Whether to generate coverage results that are consumable by [Istanbul](https://istanbul.js.org/).
- **--only** (default: `null`): Only run the provided test file (can be a glob pattern to run multiple files).

# Unit Tests

A slimple unit test suite using **glcheck** might look like the following:

```js

glCheck("Test myApp", (t, canvas) => {
    const gl = canvas.createContext("webgl2");

    gl.enable(gl.DEPTH_TEST);
    t.parameterEqual(gl, gl.DEPTH_TEST, true, "Depth test enabled");
    t.parameterNotEqual(gl, gl.DEPTH_TEST, false, "Depth test not disabled");

    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    t.pixelEqual(gl, [255, 0, 0, 255], "Framebuffer is red");
    t.pixelNotEqual(gl, [0, 0, 255, 255], "Framebuffer is not blue");

    // Buffer tests are WebGL 2-only
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_READ);
    t.bufferEqual(gl, gl.ARRAY_BUFFER, [1, 2, 3, 4], "Buffer data counts up");
    t.bufferNotEqual(gl, gl.ARRAY_BUFFER, [4, 3, 2, 1], "Buffer data does not count down");

    t.done();
});

```

Unit tests are defined for `glcheck` using the `glCheck` function. The general structure is as follows:

```js

glCheck("My test", (t, canvas) => {

    // Write some tests

    t.done();
});

```

The arguments to the test function are a tester object (described below) and a DOM canvas element. Each test will create a fresh canvas for testing and tear it down afterwards. 

Test functions can also be async: 

```js

glCheck("My test", async (t, canvas) => {

    const data = await getAsyncData();

    // Write some tests

    t.done();
});
```

The tester object's `done` method indicates that the test has completed and can also be used in async contexts: 
- `t.done()`: Indicate that a test has completed.

```js
glCheck("Basic", async (t, canvas) => {
    t.ok(true, "ok");
    t.done();
});

glCheck("Async", async (t, canvas) => {
    setTimeout(() => {
        t.ok(true, "ok");
        t.done();
    }, 50);
});
```

The tester object exposes the following basic assertions:
- `t.ok(actual, message)`: Check the truthiness of `actual`.
- `t.notOk(actual, message)`: Check the falsiness of `actual`.
- `t.equal(actual, expected, message)`: Check that `actual` and `expected` are shallowly equal.
- `t.notEqual(actual, expected, message)`: Check that `actual` and `expected` are not shallowly equal.
- `t.deepEqual(actual, expected, message)`: Check that `actual` and `expected` are deeply equal (e.g. for objects and arrays).
- `t.notDeepEqual(actual, expected, message)`: Check that `actual` and `expected` are not deeply equal (e.g. for objects and arrays).
- `t.throws(fn, message)`: Check that `fn` throws an exception.
- `t.doesNotThrow(fn, message)`: Check that `fn` does not throw an exception.

```js
glCheck("Basic assertions", (t, canvas) => {
    t.ok(true, "ok");
    t.equal(1, 1, "equal");
    t.deepEqual({a: 1, b: 2}, {a: 1, b: 2}, "deepEqual");

    // deepEqual considers all array types equivalent
    t.deepEqual([1, 2, 3, 4], new Float32Array([1, 2, 3, 4]), "deepEqual different array types");

    t.throws(() => {throw "Throw";}, "throws");

    t.done();
});
```

The tester object also exposes WebGL-specific assertions:
- `t.parameterEqual(gl, parameter, expected, message)`: Check if the WebGL `parameter` (passed to `gl.getParameter`) matches `expected`. 
- `t.parameterNotEqual(gl, parameter, expected, message)`: Check if the WebGL `parameter` (passed to `gl.getParameter`) does not match `expected`. 
- `t.pixelEqual(gl,[ uv=[0.5, 0.5],] expected, message)`: Check if the currently bound framebuffer has the value `expected` at the pixel indicated by `uv`. `uv` is a two-element array with `[0, 0]` indicating the bottom-left of the canvas, and `[1, 1]` indicating the top-right.
- `t.pixelNotEqual(gl,[ uv=[0.5, 0.5],] expected, message)`: Check if the currently bound framebuffer does not have the value `expected` at the pixel indicated by `uv`. `uv` is a two-element array with `[0, 0]` indicating the bottom-left of the canvas, and `[1, 1]` indicating the top-right.
- `t.bufferEqual(gl, binding, expected, message)` **(WebGL 2-only)**: Check if the buffer bound to `binding` contains the values in `expected`. Matching will be done based on the array type of `expected` and will default to `Float32Array`.
- `t.bufferNotEqual(gl, binding, expected, message)` **(WebGL 2-only)**: Check if the buffer bound to `binding` does not contain the values in `expected`. Matching will be done based on the array type of `expected` and will default to `Float32Array`.

```js
glCheck("GL assertions", (t, canvas) => {
    const gl = canvas.getContext("webgl2");

    t.parameterEqual(gl, gl.DEPTH_TEST, true, "parameterEqual");
    t.parameterEqual(gl, gl.VIEWPORT, [10, 20, 30, 40], "parameterEqual array");
    
    t.pixelEqual(gl, [255, 0, 0, 255], "pixelEqual center");
    t.pixelEqual(gl, [0.25, 0.75], [255, 0, 0, 255], "pixelEqual upper-left");

    // Buffer assertions are WebGL 2-only
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

Finally, the tester object exposes the async helper `loopUntil` for tests that require asynchrony:
- `t.loopUntil(fn)`: Returns a promise that starts a `requestAnimationFrame` loop, calling `fn` on each frame and resolving when it returns true.

```js
glCheck("loopUntil helper", async (t, canvas) => {
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

# Render Tests

Render tests are run by providing a list of HTML files to render in the configuration file:

```json
{
    "renderTests": "test/render/*.html"
}
```

To be usable as a render test, a page must simply indicate when it has completed rendering by setting the global `glcheck_renderDone` to `true`:

```js
window.glcheck_renderDone = true;
```

**NOTE:** It recommended to stop animations once `glcheck_renderDone` is set to ensure consistent results. 

**glcheck** also exposes a helper function `glcheck_setRAFCount` to pages loaded as render tests to simplify controlling animations and signaling that a render is complete.
- `glcheck_setRAFCount(numFrames)`: Instrument `requestAnimationFrame` to only loop `numFrames` times and set `glcheck_renderDone` afterwards.

This can be helpful in instrumenting a page to stop rendering when used as a render test, but render normally otherwise.

```js

if (window.glcheck_setRAFCount) {
    window.glcheck_setRAFCount(10);
}

requestAnimationFrame(function draw() {
    requestAnimationFrame(draw);

    // Will loop 10 times when run by glcheck,
    // normally otherwise.
});

``` 
