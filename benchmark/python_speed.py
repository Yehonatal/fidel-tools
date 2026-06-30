import os
import sys
import time
import json

# Make sure packages/py-fidel-tools is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../packages/py-fidel-tools')))

from fidel_tools import Pipeline, get_amharic_pack

def run_suite(label, payload, iterations, pipeline):
    # Warmup
    for _ in range(500):
        pipeline.normalize(payload)

    # Measure whole loop
    start = time.perf_counter()
    for _ in range(iterations):
        pipeline.normalize(payload)
    end = time.perf_counter()
    
    total_time_s = end - start
    avg_latency_us = (total_time_s / iterations) * 1000000
    throughput = iterations / total_time_s

    print(f"\n--- Python Benchmark: {label} ({iterations} iterations) ---")
    print(f"  Throughput: {throughput:.0f} ops/sec | Avg Latency: {avg_latency_us:.2f} μs")
    
    return {
        "throughput": throughput,
        "avg": avg_latency_us
    }

def main():
    pack = get_amharic_pack()
    pipeline = Pipeline(pack)
    
    base_sentences = [
        "ሐኪም ኀይሉ ሄደ።",
        "ልጁ በልቷል ሟች ቤተሰብም አለ።",
        "እባክህህህህ በጣምምምምም አመሰግናለሁህህህ።",
        "አዲስ አበባ ትልቅ ከተማ ናት።",
        "አንድ ሁለት ሦስት አራት አምስት",
        "ይህ የመጀመሪያው ዓረፍተ ነገር ነው። ሁለተኛው ደግሞ ይከተላል፡ ሦስተኛውም አለ!"
    ]
    
    short_payload = base_sentences[0]
    
    medium_parts = [base_sentences[i % len(base_sentences)] for i in range(10)]
    medium_payload = " ".join(medium_parts)
    
    large_parts = [base_sentences[i % len(base_sentences)] for i in range(100)]
    large_payload = " ".join(large_parts)
    
    short_res = run_suite('Short Payload', short_payload, 10000, pipeline)
    medium_res = run_suite('Medium Payload', medium_payload, 5000, pipeline)
    large_res = run_suite('Large Payload', large_payload, 1000, pipeline)
    
    # Save results
    results_path = os.path.join(os.path.dirname(__file__), 'python_speed_results.json')
    with open(results_path, 'w') as f:
        json.dump({
            "short": short_res,
            "medium": medium_res,
            "large": large_res
        }, f, indent=2)

if __name__ == '__main__':
    main()
