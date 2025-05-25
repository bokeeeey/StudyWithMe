import { ChatInputCommandInteraction } from "discord.js";
import mongoose from "mongoose";
import {
  createStudySession,
  endStudySession,
  answerQuestion,
} from "../services/studySession";
import { IStudySession } from "../models/StudySession";

// Store active sessions
const activeSessions = new Map<string, string>();

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

  try {
    // Create new study session
    const session = (await createStudySession(
      interaction.user.id,
      topic,
      duration
    )) as IStudySession;

    // Store session ID
    activeSessions.set(
      interaction.user.id,
      (session._id as mongoose.Types.ObjectId).toString()
    );

    // Send initial response
    await interaction.reply({
      content: `학습 세션을 시작합니다!\n주제: ${topic}\n목표 시간: ${duration}분\n\n학습이 완료되면 /end 명령어를 입력해주세요.`,
      ephemeral: false,
    });

    // Set timeout to end session
    setTimeout(async () => {
      const sessionId = activeSessions.get(interaction.user.id);
      if (sessionId) {
        try {
          const endedSession = await endStudySession(sessionId);
          if (endedSession.questions && endedSession.questions.length > 0) {
            await interaction.followUp({
              content: `학습 시간이 종료되었습니다!\n\n학습 내용을 확인하기 위한 질문입니다:\n${endedSession.questions[0].question}\n\n답변은 /answer 명령어로 입력해주세요.`,
              ephemeral: false,
            });
          }
        } catch (error) {
          console.error("Error ending session:", error);
        }
      }
    }, duration * 60 * 1000); // Convert minutes to milliseconds
  } catch (error) {
    console.error("Error creating study session:", error);
    await interaction.reply({
      content: "학습 세션 생성 중 오류가 발생했습니다.",
      ephemeral: true,
    });
  }
};

export const handleEndCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  const sessionId = activeSessions.get(interaction.user.id);
  if (!sessionId) {
    await interaction.reply({
      content: "진행 중인 학습 세션이 없습니다.",
      ephemeral: true,
    });
    return;
  }

  try {
    const session = await endStudySession(sessionId);
    activeSessions.delete(interaction.user.id);

    if (session.questions && session.questions.length > 0) {
      await interaction.reply({
        content: `학습 세션이 종료되었습니다!\n\n학습 내용을 확인하기 위한 질문입니다:\n${session.questions[0].question}\n\n답변은 /answer 명령어로 입력해주세요.`,
        ephemeral: false,
      });
    }
  } catch (error) {
    console.error("Error ending session:", error);
    await interaction.reply({
      content: "학습 세션 종료 중 오류가 발생했습니다.",
      ephemeral: true,
    });
  }
};

export const handleAnswerCommand = async (
  interaction: ChatInputCommandInteraction
) => {
  const answer = interaction.options.getString("answer");
  if (!answer) {
    await interaction.reply({
      content: "답변을 입력해주세요.",
      ephemeral: true,
    });
    return;
  }

  const sessionId = activeSessions.get(interaction.user.id);
  if (!sessionId) {
    await interaction.reply({
      content: "진행 중인 학습 세션이 없습니다.",
      ephemeral: true,
    });
    return;
  }

  try {
    const session = await answerQuestion(sessionId, answer);
    if (session.questions && session.questions.length > 0) {
      const currentQuestion = session.questions[session.questions.length - 1];
      await interaction.reply({
        content: `답변에 대한 피드백입니다:\n${currentQuestion.feedback}`,
        ephemeral: false,
      });
    }
  } catch (error) {
    console.error("Error processing answer:", error);
    await interaction.reply({
      content: "답변 처리 중 오류가 발생했습니다.",
      ephemeral: true,
    });
  }
};
