import mongoose from "mongoose";
import "./../utils/mongoosePagination.js";

export const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("DB connection established");
  } catch (error) {
    console.error("DB connection failed");
    throw error;
  }
};
export const testingDBConnection = async () => {
  try {
    await mongoose.connect(process.env.TEST_DB_URI);
    console.log("Testing DB connection established");
  } catch (error) {
    console.error("Testing DB connection failed");
    throw error;
  }
};
export const closeTestDBConnection = async () => {
  await mongoose.connection.close();
};
