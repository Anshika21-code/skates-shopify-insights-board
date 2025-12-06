import React from "react";
import clsx from "clsx";

export default function Button({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={clsx("px-4 py-2 rounded-md text-white bg-primary", className)}>
      {children}
    </button>
  );
}
