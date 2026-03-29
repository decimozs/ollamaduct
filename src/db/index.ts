import { SQL } from "bun";

export const db = new SQL("sqlite://pathway.db");
