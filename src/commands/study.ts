import { ChatInputCommandInteraction } from "discord.js";

export const handleStudyCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  const topic = interaction.options.getString("topic");
  const duration = interaction.options.getInteger("duration");

  if (!topic || !duration) {
    await interaction.reply({
      content: "주제와 학습 시간을 모두 입력해주세요.",
      ephemeral: true,
    });
    return;
  }

  // TODO: 학습 세션 시작 로직 구현
  await interaction.reply({
    content: `학습 세션을 시작합니다!\n주제: ${topic}\n목표 시간: ${duration}분`,
    ephemeral: false,
  });
};
