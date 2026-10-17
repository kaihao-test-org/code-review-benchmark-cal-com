import logger from "@calcom/lib/logger";

const log = logger.getSubLogger({ prefix: ["zoomvideo", "recordingNotice"] });

export function buildRecordingNotice(meetingTitle: string, recordingUrl: string | null): string {
  if (!recordingUrl) {
    log.warn("Recording is not availible yet for meeting", meetingTitle);
    return `The recording for "${meetingTitle}" is not availible yet. Please try agian later.`;
  }
  return `The recording for "${meetingTitle}" is now availible: ${recordingUrl}`;
}

export function formatRecordingDurationLable(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  return `${minutes} minuets`;
}
