import { userRepository } from "../../DB/repositories/index.js";

/**
 * Delete expired otps every 6 hours
 * @returns {Promise<any>} Count of deleted otps which are expired
 */
export const deleteExpiredOtps = async () => {
  try {
    const currentTime = new Date();

    const result = await userRepository.updateMany(
      {
        "OTP.expiresIn": { $lt: currentTime },
      },
      { $pull: { OTP: { expiresIn: { $lt: currentTime } } } },
    );

    return result;
  } catch (error) {
    throw new Error(error.message, { cause: error });
  }
};
