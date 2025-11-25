## Running the Server with Docker

Follow these steps to run the server in a Docker container on your local network:

1. **Find your LAN IP address**:

   On macOS, run:

   ```sh
   ipconfig getifaddr en0
   ```

   On Windows, run:

   ```sh
   ipconfig
   ```

   *(Look for the IPv4 Address on your network adapter.)*

2. **Build the Docker image**:

   ```sh
   docker build -t <image-name> .
   ```

3. **Run the Docker container, binding to your LAN IP:**

   ```sh
   docker run --rm --name <container-name> -p <LAN-IP>:8000:8000 <image-name>
   ```

   - Replace `<LAN-IP>` with your LAN IP address from step 1.
   - Replace `<image-name>` and `<container-name>` as you like.

Now the server will be accessible to other devices on your local network at `http://<LAN-IP>:8000`.
