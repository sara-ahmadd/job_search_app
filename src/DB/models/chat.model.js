import { model, Schema, Types } from "mongoose";

const chatSchema = new Schema({
  senderId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiverId: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
  messages: [
    {
      message: { type: String },
      senderId: {
        type: Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

export const ChatModel = model("Chat", chatSchema);
