import React, { useState } from "react";
import { Lock, Earth, Users, Calendar } from "lucide-react";
import { TabsContent } from "../ui/tabs";
import { Switch } from "../ui/switch";

const AboutChannelContent = ({ channel, isOwner, updateChannelVisibility }) => {
  const [isPublic, setIsPublic] = useState(
    channel.channelVisibility === "PUBLIC"
  );

  const handleVisibilityChange = async (checked) => {
    setIsPublic(checked);
    const newVisibility = checked ? "PUBLIC" : "PRIVATE";
    updateChannelVisibility(newVisibility);
  };

  const formattedJoinDate = new Date(channel.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <TabsContent value="about">
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          About {channel.name}
        </h3>

        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {channel.description ||
            "The channel owner has not yet provided a description."}
        </p>
      </div>

      <h3 className="text-xl font-bold dark:text-white mb-4">
        Details & Stats
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <Users className="h-6 w-6 text-indigo-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Subscribers
            </p>
            <p className="text-lg text-left font-bold text-gray-900 dark:text-white">
              {channel.subscribersCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <Calendar className="h-6 w-6 text-indigo-500 mr-4" />
          <div>
            <p className="text-sm text-left text-gray-500 dark:text-gray-400">
              Joined Date
            </p>
            <p className="text-lg text-left font-bold text-gray-900 dark:text-white">
              {formattedJoinDate}
            </p>
          </div>
        </div>

        <div className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          {isPublic ? (
            <Earth className="h-6 w-6 text-green-600 mr-4" />
          ) : (
            <Lock className="h-6 w-6 text-yellow-600 mr-4" />
          )}
          <div>
            <p className="text-sm text-left text-gray-500 dark:text-gray-400">
              Status
            </p>
            <p
              className={`text-lg font-bold ${
                isPublic ? "text-green-600 text-left" : "text-yellow-600"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-start justify-between p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-md border border-indigo-200 dark:border-indigo-800">
            <div className="flex flex-col">
              <p className="text-base font-semibold text-indigo-800 dark:text-indigo-200">
                Set Channel Visibility
              </p>
              <p className="text-xs text-left text-indigo-600 dark:text-indigo-400">
                {isPublic
                  ? "Visible to everyone."
                  : "Visible only to you and staff."}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleVisibilityChange}
              className="ml-4"
            />
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default AboutChannelContent;
