import { getUserAvailabilitySnapshot } from "@calcom/lib/getUserAvailabilitySnapshot";

import type { TrpcSessionUser } from "../../../types";
import type { TUserInputSchema } from "./user.schema";

type UserOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TUserInputSchema;
};

export const userHandler = async ({ input }: UserOptions) => {
  return getUserAvailabilitySnapshot(
    { returnDateOverrides: true, bypassBusyCalendarTimes: false, ...input },
    undefined
  );
};
