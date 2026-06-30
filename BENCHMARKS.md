# Fidel Tools Performance & Accuracy Benchmarks

This page documents the performance characteristics (latency percentiles and throughput) and accuracy metrics of the Fidel Tools Amharic pre-processing engine.

*Regenerated dynamically by CI to prevent documentation staleness.*

## System Environment Specification
- **OS**: Linux 7.0.10-201.fc44.x86_64 (x64)
- **Processor**: 11th Gen Intel(R) Core(TM) i5-1155G7 @ 2.50GHz (8 cores)
- **Node.js**: v22.22.2

## Accuracy Verification Suite
Evaluated against a labeled test corpus of 2,000 sentences.

| Task | Metric | JS Fallback | WASM Engine | Target Threshold |
| --- | --- | :---: | :---: | :---: |
| **Normalization** | Exact Match Accuracy | 100.00% | 100.00% | 100.00% |
| **Stemming** | Root Match Accuracy | 100.00% | 100.00% | 100.00% |
| **Tokenization** | Token Boundary F1 Score | 100.00% | 100.00% | 100.00% |

## Performance Throughput & Latency (JS vs WASM)
Comparing pure JavaScript normalization with the compiled WebAssembly (WASM) engine.

### Short Sentences (~15 characters)
*Payload: "ሐኪም ኀይሉ ሄደ።"*
- **JS Throughput**: 469759 ops/sec | p50: 1.43 μs | p95: 3.50 μs | p99: 5.35 μs
- **WASM Throughput**: 454676 ops/sec | p50: 1.39 μs | p95: 3.33 μs | p99: 4.33 μs
- **WASM Speedup**: **0.97x**

### Medium Paragraphs (~200 characters)
- **JS Throughput**: 60756 ops/sec | p50: 14.96 μs | p95: 21.98 μs | p99: 28.10 μs
- **WASM Throughput**: 81996 ops/sec | p50: 11.44 μs | p95: 16.05 μs | p99: 19.29 μs
- **WASM Speedup**: **1.35x**

### Large Documents (~2000 characters)
- **JS Throughput**: 6563 ops/sec | p50: 145.74 μs | p95: 184.21 μs | p99: 327.89 μs
- **WASM Throughput**: 8295 ops/sec | p50: 116.86 μs | p95: 139.19 μs | p99: 182.52 μs
- **WASM Speedup**: **1.26x**

## Analysis & Methodology
1. **Boundary-Crossing Overhead Gate**: WebAssembly runs at near-native compile speeds. However, passing data between JS and WASM requires allocating heap memory and encoding/decoding strings to UTF-8 bytes. On short strings, this boundary-crossing overhead dominates the computation time. On larger payloads (~200 to 2,000+ chars), the actual computation time eclipses the boundary transitions, showing the clear benefits of the compiled Rust normalizer.
