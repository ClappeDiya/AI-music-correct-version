import React from "react";
import { classNames } from "../utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          "mx-auto w-full",
          size === "sm" && "max-w-screen-sm",
          size === "md" && "max-w-screen-md",
          size === "lg" && "max-w-screen-lg",
          size === "xl" && "max-w-screen-xl",
          size === "full" && "max-w-full",
          className,
        )}
        {...props}
      />
    );
  },
);

Container.displayName = "Container";
