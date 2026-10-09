import { FeaturesRepository } from "@calcom/features/flags/features.repository";

export async function isBookingsCalendarViewEnabled(teamId?: number | null): Promise<boolean> {
  if (!teamId) {
    return false;
  }

  const featuresRepository = new FeaturesRepository();
  return await featuresRepository.checkIfTeamHasFeature(teamId, "bookings-calendar-view");
}
