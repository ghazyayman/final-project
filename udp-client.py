import socket

target_host = "www.google.com"
target_port = 80

# create a socket object
client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# send some data
client.sendto(b"Hello, World!", (target_host, target_port))

# receive data
data, addr = client.recvfrom(4096)

client.close()

print("Received data:", data)
print("From address:", addr)
