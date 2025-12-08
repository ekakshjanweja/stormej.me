import { Children, type HTMLAttributes, type SVGProps } from "react";
import { cn } from "@/lib/utils";

export type CursorProps = HTMLAttributes<HTMLSpanElement>;

export const Cursor = ({ className, children, ...props }: CursorProps) => (
  <span
    className={cn(
      "pointer-events-none relative select-none",
      "animate-in fade-in zoom-in-90 duration-300 ease-out",
      "drop-shadow-lg",
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export type CursorPointerProps = SVGProps<SVGSVGElement>;

export const CursorPointer = ({ className, ...props }: CursorPointerProps) => (
  <svg
    aria-hidden="true"
    className={cn(
      "size-4 drop-shadow-md",
      "transition-all duration-200 ease-out",
      className
    )}
    fill="none"
    focusable="false"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19.438 6.716 1.115.05A.832.832 0 0 0 .05 1.116L6.712 19.45a.834.834 0 0 0 1.557.025l3.198-8 7.995-3.2a.833.833 0 0 0 0-1.559h-.024Z"
      fill="currentColor"
    />
  </svg>
);

export type CursorBodyProps = HTMLAttributes<HTMLSpanElement>;

export const CursorBody = ({
  children,
  className,
  ...props
}: CursorBodyProps) => (
  <span
    className={cn(
      "relative ml-3 flex flex-col whitespace-nowrap rounded-2xl py-1.5 pr-3.5 pl-3 text-xs",
      Children.count(children) > 1 && "rounded-tl-md [&>:first-child]:opacity-80",
      "shadow-xl backdrop-blur-sm",
      "border border-white/20 dark:border-white/10",
      "animate-in fade-in slide-in-from-left-2 zoom-in-95 duration-300 ease-out",
      "transition-all duration-200 ease-out",
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export type CursorNameProps = HTMLAttributes<HTMLSpanElement>;

export const CursorName = ({ className, ...props }: CursorNameProps) => (
  <span
    className={cn(
      "font-semibold tracking-tight",
      "animate-in fade-in duration-200",
      className
    )}
    {...props}
  />
);

export type CursorMessageProps = HTMLAttributes<HTMLSpanElement>;

export const CursorMessage = ({ className, ...props }: CursorMessageProps) => (
  <span
    className={cn(
      "animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-200 ease-out",
      "transition-all duration-150",
      "leading-relaxed",
      className
    )}
    {...props}
  />
);
