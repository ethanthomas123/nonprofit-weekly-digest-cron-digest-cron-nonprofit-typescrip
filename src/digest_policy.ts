import { z } from "zod";

export const weeklySnapshotSchema = z.object({
  weekEnding: z.iso.date(),
  donorReceipts: z.array(z.object({
    donorName: z.string().min(1),
    amountCents: z.number().int().positive(),
    issued: z.boolean()
  })),
  volunteerShifts: z.array(z.object({
    volunteerName: z.string().min(1),
    startsAt: z.iso.datetime(),
    confirmed: z.boolean()
  })),
  campaign: z.object({
    name: z.string().min(1),
    raisedCents: z.number().int().nonnegative(),
    goalCents: z.number().int().positive()
  })
}).strict();

export type WeeklySnapshot = z.infer<typeof weeklySnapshotSchema>;

export type WeeklyDigest = {
  weekEnding: string;
  subject: string;
  pendingReceiptDonors: string[];
  unconfirmedVolunteers: string[];
  campaignProgressPercent: number;
};

export function compileWeeklyDigest(snapshot: WeeklySnapshot): WeeklyDigest {
  const pendingReceiptDonors = snapshot.donorReceipts
    .filter((receipt) => !receipt.issued)
    .map((receipt) => receipt.donorName)
    .sort();
  const unconfirmedVolunteers = snapshot.volunteerShifts
    .filter((shift) => !shift.confirmed)
    .map((shift) => shift.volunteerName)
    .sort();
  const campaignProgressPercent = Math.min(
    100,
    Math.round((snapshot.campaign.raisedCents / snapshot.campaign.goalCents) * 100)
  );

  return {
    weekEnding: snapshot.weekEnding,
    subject: `${snapshot.campaign.name}: weekly operations digest`,
    pendingReceiptDonors,
    unconfirmedVolunteers,
    campaignProgressPercent
  };
}
