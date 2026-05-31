import Link from "next/link";
import type { ComponentType } from "react";
import {
  BookOpenCheck,
  Check,
  HelpCircle,
  MessageSquareText,
  UserRoundCheck,
} from "lucide-react";
import {
  getEmployeeJourneyStops,
  type EmployeeJourneyStopId,
} from "@/lib/copy/employee-journey";
import { cn } from "@/lib/utils";

type EmployeeJourneyProps = {
  current: EmployeeJourneyStopId;
  className?: string;
  compact?: boolean;
};

const iconByStop: Record<
  EmployeeJourneyStopId,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  question: HelpCircle,
  answer: MessageSquareText,
  evidence: BookOpenCheck,
  hr: UserRoundCheck,
};

export function EmployeeJourney({
  current,
  className,
  compact = false,
}: EmployeeJourneyProps) {
  const stops = getEmployeeJourneyStops(current);

  return (
    <nav
      aria-label="Hành trình tra cứu bảo hiểm"
      className={cn(
        "rounded-2xl border border-sky-100 bg-white/90 p-2 shadow-sm shadow-slate-950/5",
        className,
      )}
    >
      <ol
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {stops.map((stop) => {
          const Icon = iconByStop[stop.id];
          const isCurrent = stop.state === "current";
          const isComplete = stop.state === "complete";

          return (
            <li key={stop.id}>
              <Link
                href={stop.href}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-full rounded-xl border transition-colors",
                  compact
                    ? "min-h-16 flex-col items-center justify-center gap-2 px-2 py-2 text-center"
                    : "gap-3 px-3 py-3",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-transparent bg-sky-50/70 text-foreground hover:bg-sky-100/80",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                    isCurrent
                      ? "bg-white/15 text-white"
                      : isComplete
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-sky-900 ring-1 ring-sky-100",
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden />
                  )}
                </span>
                <span className={cn("min-w-0", compact ? "w-full" : "")}>
                  <span
                    className={cn(
                      "block font-semibold leading-snug",
                      compact ? "text-xs" : "text-sm",
                    )}
                  >
                    <span className="mr-1 tabular-nums">{stop.number}.</span>
                    {compact ? stop.shortTitle : stop.title}
                  </span>
                  {!compact ? (
                    <span
                      className={cn(
                        "mt-1 block text-xs leading-relaxed",
                        isCurrent ? "text-white/80" : "text-muted-foreground",
                      )}
                    >
                      {stop.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
