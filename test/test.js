///////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)
//
// Copyright (c) 2019 Tarek Sherif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
///////////////////////////////////////////////////////////////////////////////////

glcheck("Basic assertions", (t, canvas) => {
    t.ok(true, "ok");
    t.notOk(false, "notOk");

    t.equal(1, 1, "equal");
    t.notEqual(1, 2, "notEqual");

    t.deepEqual({a: 1, b: 2}, {a: 1, b: 2}, "deepEqual");
    t.notDeepEqual({a: 1, b: 2}, {a: 1, b: 3}, "notDeepEqual");

    t.deepEqual([1, 2, 3, 4], new Float32Array([1, 2, 3, 4]), "deepEqual");
    t.deepEqual(new Float32Array([1, 2, 3, 4]), [1, 2, 3, 4], "deepEqual");
    t.deepEqual(new Float32Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 4]), "deepEqual");
    t.deepEqual(new Float32Array([1, 2, 3, 4]), new Uint8Array([1, 2, 3, 4]), "deepEqual");
    t.deepEqual(new Uint8Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 4]), "deepEqual");

    t.notDeepEqual([1, 2, 3, 4], new Float32Array([1, 2, 3, 5]), "notDeepEqual");
    t.notDeepEqual(new Float32Array([1, 2, 3, 4]), [1, 2, 3, 5], "notDeepEqual");
    t.notDeepEqual(new Float32Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 5]), "notDeepEqual");
    t.notDeepEqual(new Float32Array([1, 2, 3, 4]), new Uint8Array([1, 2, 3, 5]), "notDeepEqual");
    t.notDeepEqual(new Uint8Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 5]), "notDeepEqual");

    t.throws(() => {throw "Throw";}, "throws");
    t.doesNotThrow(() => "No throw", "doesNotThrow");

    t.done();
});

glcheck("GL parameters", (t, canvas) => {
    let gl = canvas.getContext("webgl2");

    gl.enable(gl.DEPTH_TEST);
    t.parameterEqual(gl, gl.DEPTH_TEST, true, "parameterEqual primitive");
    t.parameterNotEqual(gl, gl.DEPTH_TEST, false, "parameterNotEqual primitive");

    gl.viewport(10, 20, 30, 40);
    t.parameterEqual(gl, gl.VIEWPORT, [10, 20, 30, 40], "parameterEqual array");
    t.parameterNotEqual(gl, gl.VIEWPORT, [11, 20, 30, 40], "parameterNotEqual array");
    
    t.done();
});

glcheck("GL buffers", (t, canvas) => {
    let gl = canvas.getContext("webgl2");

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_READ);

    t.bufferEqual(gl, gl.ARRAY_BUFFER, [1, 2, 3, 4], "bufferEqual");
    t.bufferNotEqual(gl, gl.ARRAY_BUFFER, [1, 2, 2, 4], "bufferNotEqual");

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([5, 6, 7, 8]), gl.STATIC_READ);

    t.bufferEqual(gl, gl.ARRAY_BUFFER, new Uint8Array([5, 6, 7, 8]), "bufferEqual Uint8Array");
    t.bufferNotEqual(gl, gl.ARRAY_BUFFER, new Uint8Array([5, 6, 8, 8]), "bufferNotEqual Uint8Array");

    t.done();
});

glcheck("GL draw", (t, canvas) => {
    let gl = canvas.getContext("webgl2");

    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    t.pixelEqual(gl, [255, 0, 0, 255], "pixelEqual");
    t.pixelNotEqual(gl, [255, 255, 0, 255], "pixelNotEqual");

    let halfWidth = gl.drawingBufferWidth / 2;
    let halfHeight = gl.drawingBufferHeight / 2;

    gl.enable(gl.SCISSOR_TEST);

    // Bottom left
    gl.scissor(0, 0, halfWidth, halfHeight);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Bottom right
    gl.scissor(halfWidth, 0, halfWidth, halfHeight);
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Top left
    gl.scissor(0, halfHeight, halfWidth, halfHeight);
    gl.clearColor(0, 0, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Top right
    gl.scissor(halfWidth, halfHeight, halfWidth, halfHeight);
    gl.clearColor(1, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    t.pixelEqual(gl, [0.25, 0.25], [255, 0, 0, 255], "pixelEqual uv");
    t.pixelNotEqual(gl, [0.25, 0.25], [255, 0, 0, 128], "pixelNotEqual uv");
    
    t.pixelEqual(gl, [0.75, 0.25], [0, 255, 0, 255], "pixelEqual uv");
    t.pixelNotEqual(gl, [0.75, 0.25], [0, 255, 0, 128], "pixelNotEqual uv");
    
    t.pixelEqual(gl, [0.25, 0.75], [0, 0, 255, 255], "pixelEqual uv");
    t.pixelNotEqual(gl, [0.25, 0.75], [0, 0, 255, 128], "pixelNotEqual uv");
    
    t.pixelEqual(gl, [0.75, 0.75], [255, 255, 0, 255], "pixelEqual uv");
    t.pixelNotEqual(gl, [0.75, 0.75], [255, 255, 0, 128], "pixelNotEqual uv");

    t.done();
});

glcheck("Async", async (t, canvas) => {
    let done = false;
    setTimeout(() => {
        t.ok(true, "Async test");
        done = true;
    }, 100);
    
    await t.loopUntil(() => done);

    t.done();
});

glcheck("Assets", async (t, canvas) => {
    let response = await fetch("assets/asset.json");
    let json = await response.json();

    t.equal(json.result, "PASSED", "Fetched an asset.")

    t.done();
});

glcheck("Bad json", async (t, canvas) => {
    const circular1 = {a: 1};
    circular1.circular = circular1;

    const circular2 = {a: 2};
    circular2.circular = circular2;

    t.deepEqual(circular1, circular1, "deepEqual circular objects");
    t.notDeepEqual(circular1, circular2, "notDeepEqual circular objects");

    const circular3 = {a: 1};
    circular3.circular = circular3;
    circular3.constructor = null;

    const circular4 = {a: 2};
    circular4.circular = circular4;
    circular4.constructor = null;

    t.deepEqual(circular3, circular3, "deepEqual circular objects with no constructor");
    t.notDeepEqual(circular3, circular4, "notDeepEqual circular objects with no constructor");

    const circular5 = {a: 1};
    circular5.circular = circular5;
    circular5.constructor = null;
    circular5.toString = null;

    const circular6 = {a: 2};
    circular6.circular = circular6;
    circular6.constructor = null;
    circular6.toString = null;

    t.deepEqual(circular5, circular5, "deepEqual circular objects with no constructor, no toString");
    t.notDeepEqual(circular5, circular6, "notDeepEqual circular objects with no constructor, no toString");

    t.done();
});
