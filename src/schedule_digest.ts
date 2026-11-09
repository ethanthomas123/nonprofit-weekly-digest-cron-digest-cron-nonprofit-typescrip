import { createHash } from "node:crypto";
import { infrai } from "./infrai_client.js";

const task = process.env.DIGEST_WEBHOOK_URL;
if (!task) throw new Error("DIGEST_WEBHOOK_URL is required");

const cron_expr = "0 9 * * 1";
const idempotencyKey = createHash("sha256")
  .update(`nonprofit-weekly-digest:${cron_expr}:${task}`)
  .digest("hex");

const result = await infrai.cron.create({ cron_expr, task }, idempotencyKey);
console.log(JSON.stringify({ scheduled: true, job_id: result.job_id }, null, 2));
