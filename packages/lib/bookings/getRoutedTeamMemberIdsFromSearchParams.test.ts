import { describe, expect, it } from "vitest";

import { getRoutedTeamMemberIdsFromSearchParams } from "./getRoutedTeamMemberIdsFromSearchParams";

describe("getRoutedTeamMemberIdsFromSearchParams", () => {
  it("returns null when the routed team members param is absent", () => {
    expect(getRoutedTeamMemberIdsFromSearchParams(new URLSearchParams("email=booker@example.com"))).toBe(
      null
    );
  });

  it("parses a comma separated list of member ids", () => {
    expect(
      getRoutedTeamMemberIdsFromSearchParams(new URLSearchParams("cal.routedTeamMemberIds=12,7,301"))
    ).toEqual([12, 7, 301]);
  });

  it("drops blank, non numeric, non positive and duplicate ids", () => {
    expect(
      getRoutedTeamMemberIdsFromSearchParams(
        new URLSearchParams("cal.routedTeamMemberIds=5,,abc, 9 ,5,0,-3,2.5,9")
      )
    ).toEqual([5, 9]);
  });
});
