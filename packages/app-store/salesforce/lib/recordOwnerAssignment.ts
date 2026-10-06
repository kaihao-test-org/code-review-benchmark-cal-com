import { AssignmentReasonRepository } from "@calcom/lib/server/repository/assignmentReason";

import { assignmentReasonHandler } from "./assignmentReasonHandler";

export const getRecordOwnerEmail = (record: any): string | null => {
  const email = record?.Owner?.Email;
  return typeof email === "string" ? email.toLowerCase() : null;
};

export async function saveRecordOwnerAssignment({
  bookingId,
  routingFormResponseId,
  recordType,
  record,
}: {
  bookingId: number;
  routingFormResponseId: number;
  recordType: string;
  record: any;
}) {
  const ownerEmail = getRecordOwnerEmail(record);
  if (!ownerEmail) return null;

  const reason = await assignmentReasonHandler({
    recordType,
    teamMemberEmail: ownerEmail,
    routingFormResponseId,
    recordId: typeof record?.Id === "string" ? record.Id : undefined,
  });
  if (!reason) return null;

  return await AssignmentReasonRepository.createForBooking(bookingId, reason);
}
