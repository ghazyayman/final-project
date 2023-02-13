import socket
import struct
import sys
import time

# Use the IP address or hostname of the target system
hostname = "google.com"

# Create a raw socket and specify the type as ICMP
try:
    my_socket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
except socket.error as e:
    print("Error creating socket: %s" % e)
    sys.exit()

# Look up the IP address of the target hostname
try:
    dest_ip = socket.gethostbyname(hostname)
except socket.gaierror as e:
    print("Error resolving hostname: %s" % e)
    sys.exit()

# Define the ICMP header
# The header consists of the type, code, checksum, identifier, and sequence number
icmp_header = struct.pack("!BBHHH", 8, 0, 0, 1, 1)

# Calculate the checksum on the data and the header
# The checksum is calculated over the header and data as a single unit
icmp_packet = icmp_header
icmp_checksum = socket.htons(
    socket.cksum(icmp_packet)
)
icmp_header = struct.pack("!BBHHH", 8, 0, icmp_checksum, 1, 1)
icmp_packet = icmp_header

# Send the ICMP request to the target
my_socket.sendto(icmp_packet, (dest_ip, 1))

# Receive the response from the target
recv_packet, address = my_socket.recvfrom(1024)

# Unpack the response data
icmp_header = recv_packet[20:28]
type, code, checksum, identifier, sequence = struct.unpack("!BBHHH", icmp_header)

# Display the response information
print("Type: %d, Code: %d, Checksum: %d, Identifier: %d, Sequence: %d" % (type, code, checksum, identifier, sequence))
