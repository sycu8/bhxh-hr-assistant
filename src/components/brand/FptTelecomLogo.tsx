import Image from "next/image";
import { cn } from "@/lib/utils";

type FptTelecomLogoProps = {
  className?: string;
  priority?: boolean;
};

/** Logo FPT Telecom chính thức — dọc (mobile) / ngang (desktop). */
export function FptTelecomLogo({ className, priority = false }: FptTelecomLogoProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/fpt-telecom-logo-vertical.png"
        alt="FPT Telecom"
        width={80}
        height={56}
        className="h-9 w-auto sm:hidden"
        priority={priority}
      />
      <Image
        src="/fpt-telecom-logo-horizontal.png"
        alt="FPT Telecom"
        width={160}
        height={40}
        className="hidden h-8 w-auto sm:block md:h-9"
        priority={priority}
      />
    </span>
  );
}
