import crypto from "crypto";

export const createRequestHash = (data: unknown) => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};
