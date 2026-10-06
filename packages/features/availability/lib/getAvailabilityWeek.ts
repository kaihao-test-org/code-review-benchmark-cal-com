import dayjs from "dayjs";

export type AvailabilityWeek = {
  key: string;
  start: Date;
  end: Date;
};

export const getAvailabilityWeek = (date: Date | string, timeZone: string): AvailabilityWeek => {
  const day = dayjs(date).tz(timeZone);

  return {
    key: day.format("GGGG-[W]WW"),
    start: day.startOf("isoWeek").toDate(),
    end: day.endOf("isoWeek").toDate(),
  };
};
