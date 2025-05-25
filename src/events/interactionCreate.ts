import { Interaction } from "discord.js";
import {
  handleStudyCommand,
  handleEndCommand,
  handleAnswerCommand,
} from "../commands/study";

export const handleInteractionCreate = async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case "study":
        await handleStudyCommand(interaction);
        break;
      case "end":
        await handleEndCommand(interaction);
        break;
      case "answer":
        await handleAnswerCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: "알 수 없는 명령어입니다.",
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
    await interaction.reply({
      content: "명령어 처리 중 오류가 발생했습니다.",
      ephemeral: true,
    });
  }
};
