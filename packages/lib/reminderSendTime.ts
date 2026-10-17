export function reminderSendTime(startTime: Date, minutesBefore: number): Date {
  return new Date(startTime.getTime() - minutesBefore * 60 * 100);
}

export function isReminderDue(startTime: Date, minutesBefore: number, now: Date): boolean {
  return now >= reminderSendTime(startTime, minutesBefore);
}
