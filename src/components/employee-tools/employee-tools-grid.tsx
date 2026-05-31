import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { EmployeeToolGroup, EmployeeToolLink } from "@/lib/navigation/employee-tools";

type Props = {
  groups: EmployeeToolGroup[];
  /** Nút chính cho nhóm lương; các nhóm khác dùng secondary. */
  payrollAsCta?: boolean;
};

function ToolCard({
  tool,
  variant,
}: {
  tool: EmployeeToolLink;
  variant: "cta" | "secondary";
}) {
  const Icon = tool.icon;
  return (
    <Card className="flex flex-col border-border/80 shadow-sm">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="text-base">{tool.title}</CardTitle>
        <CardDescription className="text-pretty leading-relaxed">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button
          asChild
          variant={variant === "cta" ? "cta" : "secondary"}
          size="touch"
          className="w-full"
        >
          <Link href={tool.href}>{tool.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function EmployeeToolsGrid({ groups, payrollAsCta = true }: Props) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`tool-group-${group.id}`}>
          <div className="mb-4 max-w-2xl">
            <h2
              id={`tool-group-${group.id}`}
              className="text-lg font-semibold tracking-tight sm:text-xl"
            >
              {group.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.tools.map((tool) => (
              <ToolCard
                key={tool.href}
                tool={tool}
                variant={payrollAsCta && group.id === "payroll" ? "cta" : "secondary"}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
