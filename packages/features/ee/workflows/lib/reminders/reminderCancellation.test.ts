import { expect, it } from "vitest";
import { reminderCancellationData } from "./reminderCancellation";
it("marks a retained reminder as cancelled", () => { expect(reminderCancellationData()).toEqual({ cancelled: true }); });
