import React, { useState, useEffect } from "react";
import { Users, Settings, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { channelApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";

const ChannelHeader = ({ channel, isOwner, isSubscribed }) => {
  const auth = getAuth();
  if (!channel) return null;

  const { name, handle, avatarUrl, bannerUrl, subscribersCount } = channel;

  // State to manage subscription status locally
  const [localIsSubscribed, setLocalIsSubscribed] = useState(isSubscribed);

  // State to manage the subscriber count, initialized from prop but updated by API
  const [localSubscribersCount, setLocalSubscribersCount] = useState(
    subscribersCount || 0
  );

  // State for subscribe/unsubscribe action loading
  const [isLoading, setIsLoading] = useState(false);

  // State for initial count fetch loading (using the new API route)
  const [isCountLoading, setIsCountLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (!channel?._id || !auth.token) {
        setIsCountLoading(false);
        return;
      }

      try {
        const response = await channelApi.getSubscriberCount(
          channel._id,
          auth.token
        );

        setLocalSubscribersCount(response.subscribersCount);
      } catch (error) {
        console.error("Failed to fetch subscriber count:", error);
      } finally {
        setIsCountLoading(false);
      }
    };

    fetchSubscriberCount();
  }, [channel?._id, auth.token]);

  const handleSubscribe = async () => {
    if (isLoading || !auth.token || !channel?._id) return;

    setIsLoading(true);
    try {
      await channelApi.subscribe(channel?._id, auth.token);

      setLocalIsSubscribed(true);

      setLocalSubscribersCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (isLoading || !auth.token || !channel?._id) return;

    setIsLoading(true);
    try {
      await channelApi.unsubscribe(channel?._id, auth.token);

      setLocalIsSubscribed(false);

      setLocalSubscribersCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Unsubscription failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButton = () => {
    if (isOwner) {
      return (
        <Button
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
          onClick={() => console.log("Navigate to Channel Settings")}
          disabled={isLoading}
        >
          <Settings className="h-5 w-5 mr-2" /> Manage Channel
        </Button>
      );
    }

    if (localIsSubscribed) {
      return (
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition duration-200"
          onClick={handleUnsubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            "Unsubscribing..."
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" /> Subscribed
            </>
          )}
        </Button>
      );
    } else {
      return (
        <Button
          className="bg-red-600 hover:bg-red-700 text-white shadow-md transition duration-200"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            "Subscribing..."
          ) : (
            <>
              <Bell className="h-5 w-5 mr-2" /> SUBSCRIBE
            </>
          )}
        </Button>
      );
    }
  };

  return (
    <header className="relative w-full bg-white dark:bg-gray-800 shadow-lg">
      <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <img
          src={bannerUrl}
          alt={`${name} Banner`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="container mx-auto px-4 md:px-8 -mt-16 pb-4">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between  pb-4">
          <div className="flex items-end">
            <img
              src={avatarUrl}
              alt={`${name} Avatar`}
              className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-xl transition duration-300"
            />
            <div className="ml-6 mb-2 p-3 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 shadow-lg">
              <h1 className="text-4xl font-extrabold text-orange-300 leading-tight transition duration-150 ">
                {name}
              </h1>

              <p className="text-sm text-white font-mono">{handle}</p>

              <div className="flex items-center text-base mt-2 text-white/90">
                <Users className="h-4 w-4 mr-1 text-orange-300" />
                <span className="font-semibold text-white mr-1 transition duration-150 ">
                  {" "}
                  {/* Show loading indicator or the fetched count */}
                  {isCountLoading
                    ? "..."
                    : localSubscribersCount.toLocaleString()}
                </span>
                Subscribers
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-0">{renderActionButton()}</div>
        </div>
      </div>
    </header>
  );
};

export default ChannelHeader;
