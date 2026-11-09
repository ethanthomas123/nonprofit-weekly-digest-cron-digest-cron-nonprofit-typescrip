import assert from "node:assert/strict";
import test from "node:test";
import { compileWeeklyDigest, weeklySnapshotSchema } from "../src/digest_policy.js";

test("the digest reports only unresolved nonprofit follow-ups", () => {
  const snapshot = weeklySnapshotSchema.parse({
    weekEnding: "2026-10-23",
    donorReceipts: [
      { donorName: "Mina", amountCents: 7500, issued: false },
      { donorName: "Ari", amountCents: 2500, issued: true }
    ],
    volunteerShifts: [
      { volunteerName: "Jo", startsAt: "2026-10-24T09:00:00Z", confirmed: false },
      { volunteerName: "Lee", startsAt: "2026-10-24T10:00:00Z", confirmed: true }
    ],
    campaign: { name: "Autumn pantry", raisedCents: 76000, goalCents: 100000 }
  });

  assert.deepEqual(compileWeeklyDigest(snapshot), {
    weekEnding: "2026-10-23",
    subject: "Autumn pantry: weekly operations digest",
    pendingReceiptDonors: ["Mina"],
    unconfirmedVolunteers: ["Jo"],
    campaignProgressPercent: 76
  });
});
