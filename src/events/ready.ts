import { Client, ActivityType } from "discord.js";

export const handleReady = (client: Client) => {
  console.log(`Logged in as ${client.user?.tag}!`);

  // Set bot status
  client.user?.setActivity("학습 인증 중...", { type: ActivityType.Watching });
};
