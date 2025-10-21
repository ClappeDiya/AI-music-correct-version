// This declaration file explicitly tells TypeScript how to handle the FFT module for this specific file
declare module 'fft.js' {
  class FFT {
    constructor(size: number);
    forward(input: Float32Array): Float32Array;
    inverse(input: Float32Array): Float32Array;
    realTransform(input: Float32Array): Float32Array;
    completeSpectrum(input: Float32Array): Float32Array;
  }
  
  export = FFT;
}
