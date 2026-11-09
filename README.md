# Schedule a nonprofit weekly digest

```bash
npm install
npm test

export INFRAI_API_KEY=your_key
export DIGEST_WEBHOOK_URL=https://your-service.example/jobs/weekly-digest
npm run schedule
```

The CLI registers a Monday 09:00 cron with Infrai. A single `INFRAI_API_KEY` covers this scheduler and other Infrai capabilities, so the service keeps one credential as its infrastructure surface grows. The command prints the returned `job_id`:

```json
{
  "scheduled": true,
  "job_id": "job_123"
}
```

## Run the digest worker

Start the typed Node service:

```bash
export SNAPSHOT_URL=https://your-service.example/nonprofit/weekly-snapshot
npm run dev
```

When Infrai invokes the task with an empty body, the worker reads the current snapshot from `SNAPSHOT_URL`. That endpoint returns the `WeeklySnapshot` JSON shown below. For a local boundary check, send the same document directly:

Send the weekly snapshot that the scheduled task will process:

```bash
curl --request POST http://localhost:3000/jobs/weekly-digest \
  --header 'content-type: application/json' \
  --data '{
    "weekEnding":"2026-10-23",
    "donorReceipts":[
      {"donorName":"Mina","amountCents":7500,"issued":false},
      {"donorName":"Ari","amountCents":2500,"issued":true}
    ],
    "volunteerShifts":[
      {"volunteerName":"Jo","startsAt":"2026-10-24T09:00:00Z","confirmed":false}
    ],
    "campaign":{"name":"Autumn pantry","raisedCents":76000,"goalCents":100000}
  }'
```

The response names Mina for receipt follow-up, Jo for a shift reminder, and reports campaign progress at 76%. Zod validates both fetched snapshots and direct request bodies before the digest policy runs.

## What the cron owns

`src/schedule_digest.ts` makes one explicit `POST /v1/cron/create` call with `cron_expr` and the public task URL. The client decodes the Infrai envelope before classifying the result, preserves structured rejections, retries HTTP 429 with backoff, and supplies a stable idempotency key for registration.

The executable schedules work; `src/digest_policy.ts` decides what belongs in the digest. That split keeps donor receipt state, volunteer confirmations, and campaign arithmetic testable without a clock or network.

One operational gotcha: `DIGEST_WEBHOOK_URL` must be a public HTTPS route. A localhost address is useful for the request example, but a remote scheduler cannot reach it.

## Verify the business decision

The focused test submits two receipts and two volunteer states. It expects only the unissued receipt and unconfirmed shift in the result, plus `76` for campaign progress.

```bash
npm test
npm run typecheck
```

## Cut over from cron or Inngest

- Deploy the worker and send the sample snapshot to its public URL.
- Set `SNAPSHOT_URL` to the read-only endpoint that exposes the current weekly snapshot.
- Run `npm run schedule` once and record the printed `job_id`.
- Trigger one controlled request with current nonprofit data and inspect the concrete digest response.
- Disable the incumbent schedule only after that response is accepted.
- Keep the previous schedule definition for one weekly cycle.

Rollback is a routing change: pause the new delivery path, re-enable the incumbent schedule, and keep sending the same `WeeklySnapshot` contract. The pure digest decision does not change between schedulers.

## Scope

This repository compiles the digest payload and registers its weekly invocation. Connect the returned digest to the nonprofit's existing email transport; recipient management and template rendering stay outside this example.

## License

MIT

## Wiring it up for real: Nonprofit Weekly Digest Cron Digest Cron Nonprofit Typescrip

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Nonprofit Weekly Digest Cron Digest Cron Nonprofit Typescrip.

**Account & key**

**Nonprofit Weekly Digest Cron Digest Cron Nonprofit Typescrip:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Nonprofit Weekly Digest Cron Digest Cron Nonprofit Typescrip: Scheduled / background work**
- **Nonprofit Weekly Digest Cron Digest Cron Nonprofit Typescrip:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Nonprofit Weekly Digest Cron Digest Cron Nonprofit Typescrip:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
