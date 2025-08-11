import { EventEmitter } from "events";

import { sendEmail } from "../email/send.email.js";

export const emitter = new EventEmitter();

emitter.on("sendConfirmEmail", async (data) => {
  const result = await sendEmail(data).catch((err) => {
    // console.log(`email failed ${err}`);
  });
});

emitter.on("forgotPassword", async (data) => {
  const result = await sendEmail(data).catch((err) => {
    // console.log(`email failed ${err}`);
  });
});
