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
    validate: {
      validator: function (value) {
        // senderId (must be HR or company owner) (The sender id , required)
      },
      message: (props) => `${props.value} is not a valid date of birth!`,
    },
  },
  receiverId: {
    type: Types.ObjectId,
    required: true,
  },
  messages: [
    {
      message: { type: String },
      senderId: {
        type: Types.ObjectId,
      },
    },
  ],
});

export const ChatModel = model("Chat", chatSchema);
