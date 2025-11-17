import { useState } from "react";
import ChannelAnalyticsPage from "./ChannelAnalytics";

export default function ChannelSettings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Channel Settings</h2>
      <ChannelAnalyticsPage />
    </div>
  );
}
