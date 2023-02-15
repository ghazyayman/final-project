import psutil
import time
import os

def collect_network_traffic_performance():
    # Get network information using the psutil library
    net_io = psutil.net_io_counters()
    bytes_sent = net_io.bytes_sent
    bytes_recv = net_io.bytes_recv
    
    # Calculate the throughput
    throughput = (bytes_sent + bytes_recv) / 1024
    
    # Measure the latency and packet loss using the ping command
    response = os.popen("ping google.com -c 1").read()
    latency = response.split("time=")[1].split(" ms")[0]
    packet_loss = response.split(", ")[2].split("%")[0]
    
    # Store the data in a file
    with open("network_performance.txt", "a") as file:
        file.write("Bytes sent: {}\n".format(bytes_sent))
        file.write("Bytes received: {}\n".format(bytes_recv))
        file.write("Throughput (KB/s): {}\n".format(throughput))
        file.write("Latency (ms): {}\n".format(latency))
        file.write("Packet loss (%): {}\n".format(packet_loss))
    
    # Wait for one second
    time.sleep(1)

# Collect network traffic performance data for 10 iterations
for i in range(10):
    collect_network_traffic_performance()
