import { createServer } from "node:http";
import { ZodError } from "zod";
import { compileWeeklyDigest, weeklySnapshotSchema } from "./digest_policy.js";

async function readJson(request: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (raw.length > 0) return JSON.parse(raw);

  const snapshotUrl = process.env.SNAPSHOT_URL;
  if (!snapshotUrl) throw new Error("SNAPSHOT_URL is required for scheduled requests");
  const snapshotResponse = await fetch(snapshotUrl, { method: "GET" });
  return snapshotResponse.json();
}

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/jobs/weekly-digest") {
    sendJson(response, 404, { error: "route not found" });
    return;
  }

  try {
    const snapshot = weeklySnapshotSchema.parse(await readJson(request));
    sendJson(response, 200, { digest: compileWeeklyDigest(snapshot) });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      sendJson(response, 400, { error: "invalid weekly snapshot" });
      return;
    }
    throw error;
  }
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`digest worker listening on :${port}`));
