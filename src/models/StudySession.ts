import mongoose, { Schema, Document } from "mongoose";

export interface IStudySession extends Document {
  userId: string;
  topic: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
  status: "active" | "completed" | "cancelled";
  questions?: {
    question: string;
    answer?: string;
    feedback?: string;
  }[];
}

const StudySessionSchema = new Schema({
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
  status: {
    type: String,
    required: true,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String },
      feedback: { type: String },
    },
  ],
});

export default mongoose.model<IStudySession>(
  "StudySession",
  StudySessionSchema
);
