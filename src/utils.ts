import { createFactory } from "hono/factory";
import type { AppBindings } from "./types";

const factory = createFactory<AppBindings>({
	defaultAppOptions: {
		strict: false,
	},
});

export const createApp = factory.createApp;
export const createHandler = factory.createHandlers;
export const createMiddleware = factory.createMiddleware;
