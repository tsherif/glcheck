glTest("Basic functions", (t, canvas) => {
    t.ok(true, "ok");
    t.notOk(false, "notOk");

    t.equal(1, 1, "equal");
    t.notEqual(1, 2, "notEqual");

    t.deepEqual({a: 1, b: 2}, {a: 1, b: 2}, "deepEqual");
    t.notDeepEqual({a: 1, b: 2}, {a: 1, b: 3}, "notDeepEqual");

    t.arrayEqual([1, 2, 3, 4], new Float32Array([1, 2, 3, 4]), "arrayEqual");
    t.arrayEqual(new Float32Array([1, 2, 3, 4]), [1, 2, 3, 4], "arrayEqual");
    t.arrayEqual(new Float32Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 4]), "arrayEqual");
    t.arrayEqual(new Float32Array([1, 2, 3, 4]), new Uint8Array([1, 2, 3, 4]), "arrayEqual");
    t.arrayEqual(new Uint8Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 4]), "arrayEqual");

    t.arrayNotEqual([1, 2, 3, 4], new Float32Array([1, 2, 3, 5]), "arrayNotEqual");
    t.arrayNotEqual(new Float32Array([1, 2, 3, 4]), [1, 2, 3, 5], "arrayNotEqual");
    t.arrayNotEqual(new Float32Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 5]), "arrayNotEqual");
    t.arrayNotEqual(new Float32Array([1, 2, 3, 4]), new Uint8Array([1, 2, 3, 5]), "arrayNotEqual");
    t.arrayNotEqual(new Uint8Array([1, 2, 3, 4]), new Float32Array([1, 2, 3, 5]), "arrayNotEqual");

    t.throws(() => {throw "Throw";}, "throws");
    t.doesNotThrow(() => "No throw", "doesNotThrow");

    t.done();
});

glTest("GL parameters", (t, canvas) => {
    let gl = canvas.getContext("webgl2");

    gl.enable(gl.DEPTH_TEST);
    t.glParameterEqual(gl, gl.DEPTH_TEST, true, "glParameterEqual primitive");
    t.glParameterNotEqual(gl, gl.DEPTH_TEST, false, "glParameterNotEqual primitive");

    gl.viewport(10, 20, 30, 40);
    t.glParameterEqual(gl, gl.VIEWPORT, [10, 20, 30, 40], "glParameterEqual array");
    t.glParameterNotEqual(gl, gl.VIEWPORT, [11, 20, 30, 40], "glParameterNotEqual array");
    
    t.done();
});

glTest("GL buffers", (t, canvas) => {
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
