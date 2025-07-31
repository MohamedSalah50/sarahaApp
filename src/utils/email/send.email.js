import nodeMailer from "nodemailer";

export const sendEmail = async ({
  from = process.env.EMAIL,
  to = [],
  cc = [],
  bcc = [],
  subject = "",
  text = "",
  html = "",
  attachments = [],
} = {}) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `medo <${from}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
  });

  // console.log("Message sent:", info.messageId);
};
