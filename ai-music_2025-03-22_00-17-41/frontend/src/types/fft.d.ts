declare module 'fft.js' {
  export default class FFT {
    constructor(size: number);
    forward(input: Float32Array): Float32Array;
    inverse(input: Float32Array): Float32Array;
    realTransform(input: Float32Array): Float32Array;
    completeSpectrum(input: Float32Array): Float32Array;
  }
}
