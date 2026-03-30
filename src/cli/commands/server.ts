import { spawn } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { CONFIG_PATH, DATA_DIR, PID_PATH } from "../../config";

const DEFAULT_PORT = 3000;

export async function runServerStart(options: { port?: number }) {
	const port = options.port || DEFAULT_PORT;

	if (existsSync(PID_PATH)) {
		const pid = parseInt(readFileSync(PID_PATH, "utf-8"), 10);
		try {
			process.kill(pid, 0);
			console.log(`Server is already running (PID: ${pid})`);
			console.log(`Stop it first: ollamaduct server stop`);
			return;
		} catch {
			unlinkSync(PID_PATH);
		}
	}

	console.log("");
	console.log("Starting Ollamaduct gateway...");
	console.log(`Port: ${port}`);
	console.log(`Config: ${CONFIG_PATH}`);
	console.log(`Data directory: ${DATA_DIR}`);
	console.log("");

	const serverProcess = spawn(
		process.execPath,
		["dist/server.js", "--config", CONFIG_PATH],
		{
			stdio: "inherit",
			detached: false,
			cwd: process.cwd(),
			env: {
				...process.env,
				PORT: port.toString(),
				SHOW_API_KEY_WARNING: "true",
			},
		},
	);

	writeFileSync(PID_PATH, serverProcess.pid?.toString() || "");

	serverProcess.on("exit", (code) => {
		if (existsSync(PID_PATH)) {
			unlinkSync(PID_PATH);
		}
		if (code !== 0) {
			console.log(`Server exited with code ${code}`);
		}
	});

	console.log(`Server started (PID: ${serverProcess.pid})`);
	console.log(`Gateway running at http://localhost:${port}`);
	console.log("");
	console.log("Use 'ollamaduct server stop' to stop the server.");
}

export async function runServerStop() {
	if (!existsSync(PID_PATH)) {
		console.log("No server is currently running.");
		return;
	}

	const pid = parseInt(readFileSync(PID_PATH, "utf-8"), 10);

	if (!pid) {
		console.log("Invalid PID file. Removing...");
		unlinkSync(PID_PATH);
		return;
	}

	try {
		process.kill(pid, "SIGTERM");
		console.log(`Sent SIGTERM to server (PID: ${pid})`);
		console.log("Waiting for server to stop...");

		setTimeout(() => {
			if (existsSync(PID_PATH)) {
				try {
					process.kill(pid, 0);
					console.log("Server didn't stop gracefully, forcing...");
					process.kill(pid, "SIGKILL");
				} catch {
					// Process already dead
				}
				unlinkSync(PID_PATH);
			}
			console.log("Server stopped.");
		}, 2000);
	} catch (error) {
		console.log("Failed to stop server:", error);
		if (existsSync(PID_PATH)) {
			unlinkSync(PID_PATH);
		}
	}
}

export async function runServerStatus() {
	if (!existsSync(PID_PATH)) {
		console.log("Server is not running.");
		return;
	}

	const pid = parseInt(readFileSync(PID_PATH, "utf-8"), 10);

	try {
		process.kill(pid, 0);
		console.log(`Server is running (PID: ${pid})`);
	} catch {
		console.log("Server is not running (stale PID file).");
		unlinkSync(PID_PATH);
	}
}
