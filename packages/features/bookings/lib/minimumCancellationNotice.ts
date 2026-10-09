export type MinimumCancellationNotice = {
  time: number;
  unit: "minutes" | "hours" | "days";
};

const MINUTES_PER_UNIT: Record<MinimumCancellationNotice["unit"], number> = {
  minutes: 1,
  hours: 60,
  days: 60 * 24,
};

export const getMinimumCancellationNoticeInMinutes = (notice: MinimumCancellationNotice) =>
  notice.time * MINUTES_PER_UNIT[notice.unit];

export const getCancellationDeadline = ({
  bookingStartTime,
  minimumCancellationNotice,
}: {
  bookingStartTime: Date;
  minimumCancellationNotice: MinimumCancellationNotice;
}) => {
  const noticeInMinutes = getMinimumCancellationNoticeInMinutes(minimumCancellationNotice);
  return new Date(bookingStartTime.getTime() - noticeInMinutes * 60 * 1000);
};

export const canAttendeeCancelBooking = ({
  bookingStartTime,
  minimumCancellationNotice,
  now = new Date(),
}: {
  bookingStartTime: Date;
  minimumCancellationNotice: MinimumCancellationNotice | null;
  now?: Date;
}) => {
  if (!minimumCancellationNotice) {
    return true;
  }

  const msUntilStart = bookingStartTime.getTime() - now.getTime();
  const noticeInMinutes = getMinimumCancellationNoticeInMinutes(minimumCancellationNotice);

  return msUntilStart >= noticeInMinutes * 60;
};
