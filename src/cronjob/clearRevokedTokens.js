import cron from "node-cron";
import revokeTokenModel from "../db/models/revoke.token.model.js";
import { asyncHandler } from "../utils/response.js";
import { deleteMany } from "../db/models/dbservices.js";

export const cronjob = () => {
  cron.schedule(
    "0 3 * * *",
    asyncHandler(async () => {
      const now = Date.now();
      const result = await deleteMany({
        model: revokeTokenModel,
        filter: { expiresRefreshDate: { $lte: now } },
      });

      console.log(`Deleted ${result.deletedCount} expired revoked tokens`);
    })
  );
};
