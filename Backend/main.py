import re
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:8100"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def rreplace(s, old, new, occurrence):
    li = s.rsplit(old, occurrence)
    return new.join(li)

@app.get("/{subnet}")
async def run_recon(subnet: str):
    # Replace the last period with a slash
    subnet = rreplace(subnet, ".", "/", 1)

    # Validate the subnet format
    if not re.match(r"\d+\.\d+/\d+", subnet):
        raise HTTPException(status_code=400, detail="Invalid subnet format. Example: 16.0/26")

    # Prepare the command
    command = ["sudo", "./recon.sh", f"192.168.{subnet}"]

    # Print the command
    print("Running command:", " ".join(command))

    # Run the shell script with the provided subnet parameter
    subprocess.run(command, check=True)

    # Print a message when the shell script is done executing
    print("Shell script has finished executing.")

    # Read the output from output.txt
    try:
        with open("output.txt", "r") as file:
            output = file.read()
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Output file not found.")

    # If the output is empty, return an empty dictionary
    if not output.strip():
        return {}

    # Parse the output
    devices = output.split("\n\n--------------------------------------------------------------------------------\n\n")
    result = {}
    for i, device in enumerate(devices, 1):
        lines = device.split("\n")
        device_info = {}
        for line in lines:
            if ": " in line:
                key, value = line.split(": ", 1)
                device_info[key] = value
        if device_info:  # Check if the device_info dictionary is not empty
            result[f"Device {i}"] = device_info

    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)