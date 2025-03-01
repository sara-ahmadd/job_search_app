import { model, Schema, Types } from "mongoose";

/**
 * ## Chat Collection

1. senderId (must be HR or company owner) (The sender id , required)
2. receiverId (any user) (The sender id , required) 
3. messages (array of  {message,senderId})
 */

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
