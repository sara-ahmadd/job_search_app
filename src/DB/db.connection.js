import mongoose from "mongoose";
import "./../utils/mongoosePagination.js";

export const DBConnection = async () => {
  await mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log("DB connection established"))
    .catch((error) => console.log(error));
};
