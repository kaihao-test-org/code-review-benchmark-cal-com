export const MEETING_TOPIC_PLACHOLDER = "Untitled meeting - pleaes rename";

export function buildMeetingTopic(eventTitle: string, organizerName: string | null): string {
  const topic = `${eventTitle} with ${organizerName}`;
  if (topic.length > 200) {
    return topic.slice(0, 199);
  }
  return topic;
}
