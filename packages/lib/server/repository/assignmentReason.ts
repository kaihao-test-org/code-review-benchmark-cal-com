import prisma from "@calcom/prisma";

export class AssignmentReasonRepository {
  static async findLatestReasonFromBookingUid(bookingUid: string) {
    return await prisma.assignmentReason.findFirst({
      where: {
        booking: {
          uid: bookingUid,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async createForBooking(bookingId: number, reason: any) {
    return await prisma.assignmentReason.create({
      data: {
        bookingId,
        reasonEnum: reason.reasonEnum,
        reasonString: reason.assignmentReason,
      },
      select: {
        id: true,
        reasonEnum: true,
        reasonString: true,
      },
    });
  }
}
