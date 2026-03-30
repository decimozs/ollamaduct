import { SQL } from "bun";
import { DB_PATH } from "../config";

export const db = new SQL(`sqlite:////${DB_PATH}`);
