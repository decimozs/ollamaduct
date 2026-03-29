import { db } from "../../db";
import { getWorkspaces, formatTimestamp } from "../utils/query";
import { nanoid } from "nanoid";

interface CliOptions {
	limit?: number;
	create?: string;
	delete?: string;
	list?: boolean;
}

export async function runWorkspaces(options: CliOptions) {
	// Create a new workspace
	if (options.create) {
		const id = `ws_${nanoid(16)}`;
		const now = Date.now();

		await db`
			INSERT INTO workspaces (id, name, created_at, pii_mode, pii_response_sanitize)
			VALUES (${id}, ${options.create}, ${now}, 'balanced', 0)
		`;

		console.log("");
		console.log(`✓ Workspace created successfully!`);
		console.log(`  ID: ${id}`);
		console.log(`  Name: ${options.create}`);
		console.log("");
		return;
	}

	// Delete a workspace
	if (options.delete) {
		const workspace =
			await db`SELECT * FROM workspaces WHERE id = ${options.delete}`;

		if (workspace.length === 0) {
			console.log("");
			console.log(`✗ Workspace not found: ${options.delete}`);
			console.log("");
			return;
		}

		await db`DELETE FROM workspaces WHERE id = ${options.delete}`;

		console.log("");
		console.log(`✓ Workspace deleted: ${workspace[0].name}`);
		console.log("");
		return;
	}

	// List all workspaces
	const workspaces = await getWorkspaces(options);

	if (workspaces.length === 0) {
		console.log("No workspaces found.");
		console.log(
			'Create one with: bun run cli workspaces --create "My Workspace"',
		);
		return;
	}

	const formatted = workspaces.map((ws) => ({
		id: ws.id,
		name: ws.name,
		pii_mode: ws.pii_mode || "balanced",
		created_at: formatTimestamp(ws.created_at),
	}));

	console.log("");
	console.log(`Workspaces (${workspaces.length} total)`);
	console.log("");

	console.table(formatted);
}
