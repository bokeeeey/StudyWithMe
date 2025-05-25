import StudySession, { IStudySession } from "../models/StudySession";
import { generateQuestion, generateFeedback } from "./openai";

export const createStudySession = async (
  userId: string,
  topic: string,
  duration: number
): Promise<IStudySession> => {
  const session = new StudySession({
    userId,
    topic,
    duration,
    startTime: new Date(),
    status: "active",
  });

  await session.save();
  return session;
};

export const endStudySession = async (
  sessionId: string
): Promise<IStudySession> => {
  const session = await StudySession.findById(sessionId);
  if (!session) {
    throw new Error("Study session not found");
  }

  session.status = "completed";
  session.endTime = new Date();
  await session.save();

  // Generate a question about the topic
  const question = await generateQuestion(session.topic);
  session.questions = [{ question }];
  await session.save();

  return session;
};

export const answerQuestion = async (
  sessionId: string,
  answer: string
): Promise<IStudySession> => {
  const session = await StudySession.findById(sessionId);
  if (!session || !session.questions || session.questions.length === 0) {
    throw new Error("Study session or question not found");
  }

  const currentQuestion = session.questions[session.questions.length - 1];
  currentQuestion.answer = answer;

  // Generate feedback for the answer
  const feedback = await generateFeedback(currentQuestion.question, answer);
  currentQuestion.feedback = feedback;

  await session.save();
  return session;
};
