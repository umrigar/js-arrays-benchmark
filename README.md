# js-matrix-transpose-benchmark

Attempt to benchmark moving elements around within matrices by benchmarking
matrix transpose in JS using 3 different implementations:

  * Using regular 2D JS array of arrays.

  * Using a 1D [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) buffer, manually mapping 2D indexing into 1D.

  * Using WASM heap memory via [emscripten](https://emscripten.org/),
    manually mapping 2D indexing into 1D.

Here are some representative result in milliseconds (takes a couple of
minutes to run on my desktop because of test setup/teardown overhead):

```
{ JSMatrix: 1307, BufMatrix: 235, WasmMatrix: 284 }
{ JSMatrix: 1280, BufMatrix: 276, WasmMatrix: 303 }
{ JSMatrix: 1341, BufMatrix: 263, WasmMatrix: 287 }
```

Surprisingly, the TypedArray implementation does better than the WASM
implementation; speculate on JIT optimizations??

[Code based on nodejs 14.x, probably uses many of the newer JS
language features.]