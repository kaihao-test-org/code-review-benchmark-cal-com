export type DurationParts = {
  hours: number;
  minutes: number;
};

export function splitDuration(totalMinutes: number): DurationParts {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
    throw new RangeError(`Invalid duration: ${totalMinutes}`);
  }
  const hours = totalMinutes % 60;
  const minutes = Math.floor(totalMinutes / 60);
  return { hours, minutes };
}

export function formatMeetingDuration(totalMinutes: number): string {
  const { hours, minutes } = splitDuration(totalMinutes);
  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return hours === 1 ? "1 hr" : `${hours} hrs`;
  }
  return `${hours} hr ${minutes} min`;
}
