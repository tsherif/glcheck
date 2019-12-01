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

(function(QUnit) {

    function glCheck(name, fn) {
        QUnit.test(name, (assert) => runTest(assert, fn));
    }

    function runTest(assert, fn) {
        let canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        
        return new Promise((resolve, reject) => {
            requestAnimationFrame(() => {
                try {
                    fn(tester(assert, resolve), canvas);
                } catch (e) {
                    reject(e.message);
                }
            });  
            setTimeout(() => reject("Timeout"), 1000);
        }).finally(() => document.body.removeChild(canvas));
    }

    function tester(assert, resolve) {
        return {
            ok(result, message) {
                return assert.ok(result, message);
            },
            notOk(result, message) {
                return assert.notOk(result, message);
            },
            equal(actual, expected, message) {
                return assert.strictEqual(actual, expected, message);
            },
            notEqual(actual, expected, message) {
                return assert.notStrictEqual(actual, expected, message);
            },
            deepEqual(actual, expected, message) {
                if (ArrayBuffer.isView(actual)) {
                    actual = Array.from(actual);
                }
                if (ArrayBuffer.isView(expected)) {
                    expected = Array.from(expected);
                }
                return assert.deepEqual(actual, expected, message);
            },
            notDeepEqual(actual, expected, message) {
                if (ArrayBuffer.isView(actual)) {
                    actual = Array.from(actual);
                }
                if (ArrayBuffer.isView(expected)) {
                    expected = Array.from(expected);
                }
                return assert.notDeepEqual(actual, expected, message);
            },
            parameterEqual(gl, parameter, expected, message) {
                let actual = gl.getParameter(parameter);
                return this.deepEqual(actual, expected, message);
            },
            parameterNotEqual(gl, parameter, expected, message) {
                let actual = gl.getParameter(parameter);
                return this.notDeepEqual(actual, expected, message);
            },
            pixelEqual(gl, uv, expected, message) {
                if (!expected || typeof expected === "string") {
                    message = expected;
                    expected = uv;
                    uv = [ 0.5, 0.5 ];
                }
                return this.deepEqual(readPixel(gl, uv), expected, message);
            },
            pixelNotEqual(gl, uv, expected, message) {
                if (!expected || typeof expected === "string") {
                    message = expected;
                    expected = uv;
                    uv = [ 0.5, 0.5 ];
                }
                return this.notDeepEqual(readPixel(gl, uv), expected, message);
            },
            bufferEqual(gl, binding, expected, message) {
                return this.deepEqual(readBuffer(gl, binding, expected), expected, message);
            },
            bufferNotEqual(gl, binding, expected, message) {
                return this.notDeepEqual(readBuffer(gl, binding, expected), expected, message);
            },
            throws(fn, message) {
                return this.ok(checkThrow(fn), message);
            },
            doesNotThrow(fn, message) {
                return this.notOk(checkThrow(fn), message);
            },
            loopUntil(cond) {
                return new Promise((resolve) => {
                    requestAnimationFrame(function loop() {
                        if (cond()) {
                            resolve();
                        } else {
                            requestAnimationFrame(loop);
                        }
                    });
                });
            },
            done() {
                resolve();
            }
        };
    } 

    function readPixel(gl, uv) {
        let x = Math.floor(gl.drawingBufferWidth * uv[0]);
        let y = Math.floor(gl.drawingBufferHeight * uv[1]);

        let actual = new Uint8Array(4);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, actual);

        return actual;
    }

    function readBuffer(gl, binding, expected) {
        let ArrayType = Float32Array;
        if (ArrayBuffer.isView(expected)) {
            ArrayType = expected.constructor;
        }
        let size = gl.getBufferParameter(binding, gl.BUFFER_SIZE);
        let actual = new ArrayType(size / ArrayType.BYTES_PER_ELEMENT);
        gl.getBufferSubData(binding, 0, actual);

        return actual;
    }

    function checkThrow(fn) {
        try {
            fn();
            return false;
        } catch(e) {
            return true;
        }
    }

    function sanitizeAssertions(test) {
        test.assertions.forEach((assertion) => {
            try {
                JSON.stringify(assertion.expected);
            } catch(e) {
                if (assertion.expected.constructor) {
                    assertion.expected = `{${assertion.expected.constructor.name} object}`;
                } else {
                    let toString = assertion.expected.toString || Object.prototype.toString;
                    assertion.expected = toString.call(assertion.expected);
                }
            }

            try {
                JSON.stringify(assertion.actual);
            } catch(e) {
                if (assertion.actual.constructor) {
                    assertion.actual = `{${assertion.actual.constructor.name} object}`;
                } else {
                    let toString = assertion.actual.toString || Object.prototype.toString;
                    assertion.actual = toString.call(assertion.actual);
                }
            }
        });
    }

    window.glCheck = glCheck;

    // Functions exposed by glcheck test runner
    if (window.glcheck_testEnd) {
        QUnit.on("testEnd", (test) => {
            sanitizeAssertions(test);
            window.glcheck_testEnd(test);
        });
    }
    if (window.glcheck_runEnd) {
        QUnit.on("runEnd", window.glcheck_runEnd);
    }
})(window.QUnit);

// Don't want QUnit directly available in tests
delete window.QUnit;
