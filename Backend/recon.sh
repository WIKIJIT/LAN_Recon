#!/bin/bash

# Perform a ping scan to discover hosts and store the output in a variable
ping_scan_output=$(sudo nmap -sn "192.168.17.24/26")

# Create an empty array to store IP, MAC address, and manufacturer
declare -a ip_mac_manufacturer

# Populate the array with IP, MAC address, and manufacturer
while IFS= read -r line; do
    if [[ $line =~ ^Nmap ]]; then
        ip_address=$(echo $line | awk '{print $5}')
    elif [[ $line =~ ^MAC ]]; then
        mac_address=$(echo $line | awk '{print $3}')
        manufacturer=$(echo $line | awk -F '(' '{print $2}' | awk -F ')' '{print $1}')
        ip_mac_manufacturer+=("$ip_address $mac_address $manufacturer")
    fi
done < <(echo "$ping_scan_output")

# Get the script's directory
script_dir=$(dirname "$0")

# Open a new file in the script's directory for writing
exec > "$script_dir/output.txt"

# Iterate over each IP, MAC address, manufacturer, os and hostname
for ip_mac in "${ip_mac_manufacturer[@]}"; do
    # Print the IP, MAC address, and manufacturer
    ip_address=$(echo $ip_mac | awk '{print $1}')
    nmap_scan=$(sudo nmap -O "$ip_address" | grep "Nmap scan report" -A 20 | grep -v "Nmap scan report")
    os_details=$(echo "$nmap_scan" | grep "OS details" | awk -F ':' '{print $NF}')
    hostname=$(sudo nslookup "$ip_address" | awk '/name =/{print substr($4,1,length($4)-1)}')
    echo "IP Address: $(echo $ip_mac | awk '{print $1}')"
    echo "MAC Address: $(echo $ip_mac | awk '{print $2}')"
    echo "Manufacturer: $(echo $ip_mac | awk '{print $3}')"
    echo "OS Details: $os_details"
    echo "Hostname: $hostname"
    echo
    echo "--------------------------------------------------------------------------------"
    echo
done