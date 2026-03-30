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

export async function runCheck(): Promise<void> {
	console.log("");
	console.log(`Current version: ${VERSION}`);

	try {
		const response = await fetch(
			"https://registry.npmjs.org/ollamaduct/latest",
		);

		if (!response.ok) {
			console.error("Failed to fetch package info from npm");
			return;
		}

		const data = (await response.json()) as NpmPackageInfo;
		const latestVersion = data.version;

		console.log(`Latest version:  ${latestVersion}`);

		const comparison = compareVersions(latestVersion, VERSION);

		if (comparison > 0) {
			console.log("");
			console.log("Update available!");
			console.log(
				`Run 'ollamaduct upgrade' to update to version ${latestVersion}`,
			);
		} else if (comparison === 0) {
			console.log("");
			console.log("You are on the latest version.");
		} else {
			console.log("");
			console.log(
				"You are on a newer version than published (development build).",
			);
		}
	} catch (error) {
		console.error("Error checking for updates:", error);
	}
}
