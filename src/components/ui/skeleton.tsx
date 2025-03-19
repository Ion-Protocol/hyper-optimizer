import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-[#E2F6F4] to-[#C9EFEA]", className)}
      {...props}
    />
  );
}

export { Skeleton };
