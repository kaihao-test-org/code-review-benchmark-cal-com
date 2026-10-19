export default function shortDurationLabel(minutes: number): string {
  return minutes >= 60 ? `${Math.round(minutes / 60)}h` : `${minutes}m`;
}
