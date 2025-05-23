"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ResizableProps {
  direction: "horizontal" | "vertical";
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode[];
  className?: string;
}

export function Resizable({
  direction,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  children,
  className,
}: ResizableProps) {
  const [size, setSize] = useState(defaultSize);
  const [resizing, setResizing] = useState(false);
  const resizableRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPosRef.current = direction === "horizontal" ? e.clientX : e.clientY;
    startSizeRef.current = size;
    setResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !resizableRef.current) return;

      const containerSize =
        direction === "horizontal"
          ? resizableRef.current.offsetWidth
          : resizableRef.current.offsetHeight;

      const currentPos = direction === "horizontal" ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;

      const deltaPercent = (delta / containerSize) * 100;
      let newSize = startSizeRef.current + deltaPercent;

      // Clamp the size between minSize and maxSize
      newSize = Math.max(minSize, Math.min(maxSize, newSize));

      setSize(newSize);
    };

    const handleMouseUp = () => {
      setResizing(false);
    };

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, direction, minSize, maxSize]);

  if (children.length !== 2) {
    throw new Error("Resizable component must have exactly two children");
  }

  return (
    <div
      ref={resizableRef}
      className={cn("flex", direction === "horizontal" ? "flex-row" : "flex-col", className)}
    >
      <div
        className={cn(
          "overflow-hidden",
          direction === "horizontal" ? `w-[${size}%]` : `h-[${size}%]`
        )}
        style={direction === "horizontal" ? { width: `${size}%` } : { height: `${size}%` }}
      >
        {children[0]}
      </div>
      <div
        className={cn(
          "flex items-center justify-center",
          direction === "horizontal"
            ? "cursor-col-resize w-1 bg-border hover:bg-primary/50 active:bg-primary"
            : "cursor-row-resize h-1 bg-border hover:bg-primary/50 active:bg-primary"
        )}
        onMouseDown={handleMouseDown}
      />
      <div
        className={cn(
          "overflow-hidden",
          direction === "horizontal" ? `w-[${100 - size}%]` : `h-[${100 - size}%]`
        )}
        style={
          direction === "horizontal" ? { width: `${100 - size}%` } : { height: `${100 - size}%` }
        }
      >
        {children[1]}
      </div>
    </div>
  );
}
