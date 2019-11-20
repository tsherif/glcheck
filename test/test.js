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

    t.done();
});
