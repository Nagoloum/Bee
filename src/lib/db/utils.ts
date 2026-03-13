import { customAlphabet } from "nanoid";

// Generate a unique ID (URL-safe, 21 chars)
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  21
);

export const createId = () => nanoid();
