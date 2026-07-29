import { formatAnswerForDisplay } from "@/lib/ai/answer-composer";
import { cn } from "@/lib/utils";

type FormattedAnswerTextProps = {
  text: string;
  className?: string;
};

export function FormattedAnswerText({ text, className }: FormattedAnswerTextProps) {
  return (
    <p className={cn("whitespace-pre-line text-base leading-relaxed text-foreground", className)}>
      {formatAnswerForDisplay(text)}
    </p>
  );
}
