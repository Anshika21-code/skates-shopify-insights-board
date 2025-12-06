"use client";
import React from "react";
import Button from "@/components/ui/Button";

export default function QuickActivity() {
  return (
    <div>
      <h4 className="font-medium mb-3">Quick Activity</h4>
      <div className="small-muted mb-4">
        <div>Latest Sync <span className="text-sm text-gray-700">a minute ago</span></div>
        <div>Pending webhooks <span className="text-gray-700 font-semibold">0</span></div>
        <div>Connected stores <span className="text-gray-700 font-semibold">1</span></div>
      </div>
      <Button>Refresh Dashboard</Button>
    </div>
  );
}
