import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { resolve } from "path";
import { handleReady } from "./events/ready";
import { handleInteractionCreate } from "./events/interactionCreate";

// .env.local 파일을 명시적으로 로드
config({ path: resolve(__dirname, "../.env.local") });

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Event handlers
client.once("ready", handleReady);
client.on("interactionCreate", handleInteractionCreate);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
