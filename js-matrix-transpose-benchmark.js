#!/usr/bin/env node

const transpose = require('./transpose.js');

//const TEST = true;
const TEST = false;
let SIZE, N_ITER;

if (TEST) {
  SIZE = 5;
  N_ITER = 1;
}
else {
  SIZE = 500;
  N_ITER = 1000;
}

const MAX_VAL = 100_000;

const ENTRY_SIZE = 4;  //# of bytes per uint32_t.

function genRandIntMatrix(n) {
  return (
    Array.from({length: n}).
      map(_ => Array.from({length: n}).
	  map(_ => Math.floor(Math.random() * MAX_VAL)))
  );
}

class JSMatrix {
  constructor() {
    this.name = 'JSMatrix';
  }
  load(jsMatrix) {
    this.matrix = Array.from(jsMatrix.map(row => Array.from(row)));
    this.n = jsMatrix.length;
  }
  unload() { }
  jsMatrix() { return this.matrix; }
  transpose() {
    const {n, matrix} = this;
    for (let i = 0; i < n; i++) {
      for (let j = i+1; j < n; j++) {
	const t = matrix[i][j];
	matrix[i][j] = matrix[j][i];
	matrix[j][i] = t;
      }
    }
  }
}

class BufMatrix {
  constructor() {
    this.name = 'BufMatrix'; 
  }
  load(jsMatrix) {
    this.n = jsMatrix.length;
    this.buf = Uint32Array.from(jsMatrix.flat());
  }
  unload() { }
  jsMatrix() {
    const { n, buf } = this;
    return [...Array(n).keys()].
      map(i => [...Array(n).keys()].map(j => buf[i*n+j]));
  }
  transpose() {
    const { n, buf } = this;
    for (let i = 0; i < n; i++) {
      for (let j = i+1; j < n; j++) {
	const i1 = i*n + j;
	const i2 = j*n + i;
	const t = buf[i1];
	buf[i1] = buf[i2];
	buf[i2] = t;
      }
    }
  }
}

//<http://shockry.blogspot.com/2017/04/webassembly-sending-javascript-array-to.html>
class WasmMatrix {
  constructor(wasm) {
    this.name = 'WasmMatrix';
    this.wasm = wasm;
  }
  load(jsMatrix) {
    const wasm = this.wasm;
    const n = jsMatrix.length;
    this.n = n;
    this.base = wasm._malloc(n * n * ENTRY_SIZE);
    wasm.HEAPU32.set(Uint32Array.from(jsMatrix.flat()), this.base / ENTRY_SIZE);
  }
  unload() { this.wasm._free(this.base); this.base = -1; }
  jsMatrix() {
    const { n, base, wasm, } = this;
    return [...Array(n).keys()].
      map(i => [...Array(n).keys()].
	       map(j => wasm.HEAPU32[base/ENTRY_SIZE + i*n+j]));
  }
  transpose() {
    const { n, base, wasm } = this;
    //wasm.ccall('transpose', null, ['number', 'number'], [base, n]);
    wasm._transpose(base, n);
  }
}

function bench(matrices) {
  const results = Object.fromEntries(matrices.map(m => [m.name, 0]));
  for (let i = 0; i < N_ITER; i++) {
    //earlier code used same rand matrix for all iterations,
    //this is much slower, but an attempt to ensure no weird smarts
    //screwed up benchmarks
    const matrix0 = genRandIntMatrix(SIZE);
    if (TEST) console.log(matrix0);
    for (const matrix of matrices) {
      matrix.load(matrix0);
      const t0 = Date.now();
      matrix.transpose(matrix);
      results[matrix.name] += Date.now() - t0;
      if (TEST) console.log(matrix.jsMatrix());
      matrix.unload();
    }
  }
  return results;
}


async function go() {
  const wasm = await transpose();
  const matrices = [
    new JSMatrix(),
    new BufMatrix(),
    new WasmMatrix(wasm),
  ];
  return bench(matrices);
}

go().then(results => console.log(results));

