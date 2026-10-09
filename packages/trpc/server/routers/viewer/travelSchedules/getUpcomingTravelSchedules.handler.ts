import { TravelScheduleRepository } from "@calcom/lib/server/repository/travelSchedule";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";

type GetUpcomingTravelSchedulesOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getUpcomingTravelSchedulesHandler = async ({ ctx }: GetUpcomingTravelSchedulesOptions) => {
  return await TravelScheduleRepository.findUpcomingTravelSchedulesByUserId(ctx.user.id);
};
