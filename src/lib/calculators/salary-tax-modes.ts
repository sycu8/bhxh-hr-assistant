export type CalculatorMode = "gross-to-net" | "net-to-gross" | "take-home";

export function isCalculatorMode(value: string | null | undefined): value is CalculatorMode {
  return value === "gross-to-net" || value === "net-to-gross" || value === "take-home";
}

export function parseCalculatorMode(value: string | null | undefined): CalculatorMode {
  return isCalculatorMode(value) ? value : "gross-to-net";
}
