import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { resolve } from "path";

// .env.local 파일을 명시적으로 로드
config({ path: resolve(__dirname, "../../.env.local") });

console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN);
console.log("CLIENT_ID:", process.env.CLIENT_ID);

const commands = [
  {
    name: "study",
    description: "학습 세션을 시작합니다",
    options: [
      {
        name: "topic",
        description: "학습할 주제",
        type: 3, // STRING
        required: true,
      },
      {
        name: "duration",
        description: "학습 시간 (분)",
        type: 4, // INTEGER
        required: true,
      },
    ],
  },
];

if (!process.env.DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is not set in environment variables");
}

if (!process.env.CLIENT_ID) {
  throw new Error("CLIENT_ID is not set in environment variables");
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("슬래시 명령어를 등록하는 중...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      {
        body: commands,
      }
    );

    console.log("슬래시 명령어 등록이 완료되었습니다!");
  } catch (error) {
    console.error("슬래시 명령어 등록 중 오류 발생:", error);
  }
})();
