import { deleteExpiredOtps } from "./deleteExpiredOtps";

//run the function once the app is initiated
(async () => {
  await deleteExpiredOtps();
})();

//run the function every 6 hours
setInterval(
  async () => {
    await deleteExpiredOtps();
  },
  6 * 60 * 60 * 1000,
);
