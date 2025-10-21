const { spawn } = require("child_process");
const net = require("net");

// Check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Find the next available port starting from basePort
async function findAvailablePort(basePort) {
  let port = basePort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > basePort + 1000) {
      throw new Error("No available ports found in range");
    }
  }
  return port;
}

// Start Next.js server with Turbopack
async function startServer() {
  try {
    const basePort = 3000;
    const port = await findAvailablePort(basePort);
    console.log(`Starting Next.js server on port ${port}`);

    const nextProcess = spawn(
      "next",
      ["dev", "--turbopack", "--port", port.toString()],
      {
        stdio: "inherit",
        shell: true,
      },
    );

    nextProcess.on("error", (err) => {
      console.error("Failed to start Next.js server:", err);
      process.exit(1);
    });

    // Handle process termination
    process.on("SIGINT", () => {
      nextProcess.kill();
      process.exit();
    });

    process.on("SIGTERM", () => {
      nextProcess.kill();
      process.exit();
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

startServer();
