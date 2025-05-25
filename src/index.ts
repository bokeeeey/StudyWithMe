import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { resolve } from "path";
import { handleReady } from "./events/ready";
import { handleInteractionCreate } from "./events/interactionCreate";
import connectDB from "./config/database";

// Load environment variables
config({ path: resolve(__dirname, "../.env.local") });

// Connect to MongoDB
connectDB().catch(console.error);

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
