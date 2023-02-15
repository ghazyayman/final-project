# Define packet arrival times in seconds (replace with your own data)
packet_arrivals = [0.001, 0.015, 0.032, 0.045, 0.059, 0.071, 0.086, 0.104, 0.119, 0.131]

# Calculate throughput in bits per second (bps)
total_bits = len(packet_arrivals) * 8000  # assuming 1000-byte packets and 8 bits per byte
last_packet_time = packet_arrivals[-1]
throughput_bps = total_bits / last_packet_time
print("Throughput: {:.2f} bps".format(throughput_bps))

# Calculate latency in milliseconds (ms)
first_packet_time = packet_arrivals[0]
last_packet_time = packet_arrivals[-1]
latency_ms = (last_packet_time - first_packet_time) * 1000 / len(packet_arrivals)
print("Latency: {:.2f} ms".format(latency_ms))

# Calculate jitter in milliseconds (ms)
jitter_sum = 0
for i in range(1, len(packet_arrivals)):
    diff = packet_arrivals[i] - packet_arrivals[i-1]
    jitter_sum += abs(diff - latency_ms)
jitter_ms = jitter_sum / (len(packet_arrivals) - 1)
print("Jitter: {:.2f} ms".format(jitter_ms))
