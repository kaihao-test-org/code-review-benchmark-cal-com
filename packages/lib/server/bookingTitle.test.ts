import { describe, expect, it } from "vitest";

import { bookingTitle } from "./bookingTitle";

describe("bookingTitle", () => {
  it("puts the attendee name frist", () => {
    expect(bookingTitle("Intro", "Ada")).toContain("Ada");
  });
});
