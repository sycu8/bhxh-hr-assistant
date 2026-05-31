import { describe, expect, it } from "vitest";
import {
  EMPLOYEE_JOURNEY_STOPS,
  getEmployeeJourneyStops,
} from "@/lib/copy/employee-journey";

describe("employee journey copy", () => {
  it("defines the four employee journey stops in order", () => {
    expect(EMPLOYEE_JOURNEY_STOPS.map((stop) => stop.id)).toEqual([
      "question",
      "answer",
      "evidence",
      "hr",
    ]);
  });

  it("marks the selected stop as current and earlier stops as complete", () => {
    const stops = getEmployeeJourneyStops("evidence");

    expect(stops.map((stop) => stop.state)).toEqual([
      "complete",
      "complete",
      "current",
      "upcoming",
    ]);
  });

  it("falls back to question when the selected stop is unknown", () => {
    const stops = getEmployeeJourneyStops("missing");

    expect(stops[0].state).toBe("current");
    expect(stops.slice(1).every((stop) => stop.state === "upcoming")).toBe(
      true,
    );
  });
});
