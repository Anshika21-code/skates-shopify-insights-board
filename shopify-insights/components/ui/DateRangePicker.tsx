"use client";
import React from "react";

export default function DateRangePicker() {
  return (
    <div className="flex items-center gap-2">
      <input type="date" className="border rounded-md p-2" />
      <input type="date" className="border rounded-md p-2" />
    </div>
  );
}
