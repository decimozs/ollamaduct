import { execSync } from "node:child_process";
import { VERSION } from "../index";

interface NpmPackageInfo {
	version: string;
}

function compareVersions(a: string, b: string): number {
	const partsA = a.split(".").map(Number);
	const partsB = b.split(".").map(Number);

	for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
		const numA = partsA[i] || 0;
		const numB = partsB[i] || 0;
		if (numA > numB) return 1;
		if (numA < numB) return -1;
	}
	return 0;
}

async function getLatestVersion(): Promise<string | null> {
	try {
		const response = await fetch(
			"https://registry.npmjs.org/@ollamaduct/gateway/latest",
		);
		if (!response.ok) {
			return null;
		}
		const data = (await response.json()) as NpmPackageInfo;
		return data.version;
	} catch {
		return null;
	}
}

function hasBun(): boolean {
	try {
		execSync("bun --version", { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

export async function runUpgrade(options: { dryRun?: boolean }): Promise<void> {
	console.log("");
	console.log(`Current version: ${VERSION}`);

	const latestVersion = await getLatestVersion();

	if (!latestVersion) {
		console.error("Failed to fetch latest version from npm");
		return;
	}

	console.log(`Latest version:  ${latestVersion}`);

	const comparison = compareVersions(latestVersion, VERSION);

	if (comparison <= 0) {
		console.log("");
		if (comparison === 0) {
			console.log("You are already on the latest version.");
		} else {
			console.log(
				"You are on a newer version than published (development build).",
			);
		}
		return;
	}

	console.log("");
	console.log("Update available!");

	if (options.dryRun) {
		console.log(`Would upgrade: ${VERSION} → ${latestVersion}`);
		console.log("(dry-run mode - no changes made)");
		return;
	}

	console.log(`Upgrading to version ${latestVersion}...`);

	const useBun = hasBun();

	try {
		if (useBun) {
			console.log("Using bun to upgrade...");
			execSync("bun install -g @ollamaduct/gateway", { stdio: "inherit" });
		} else {
			console.log("Using npm to upgrade...");
			execSync("npm install -g @ollamaduct/gateway", { stdio: "inherit" });
		}

		console.log("");
		console.log("Upgrade complete!");
		console.log("Run 'ollamaduct --version' to verify.");
	} catch (error) {
		console.error("Failed to upgrade:", error);
		console.log("");
		console.log("You can manually upgrade by running:");
		console.log(`  npm install -g @ollamaduct/gateway`);
		console.log(`or`);
		console.log(`  bun install -g @ollamaduct/gateway`);
	}
}
