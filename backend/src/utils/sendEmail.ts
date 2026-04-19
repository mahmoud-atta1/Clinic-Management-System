import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"عيادتي | الدعم الفني" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">نظام عيادتي</h2>
        <p style="font-size: 16px; color: #333;">${options.message.replace('\n', '<br>')}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">هذه الرسالة مرسلة تلقائياً، يرجى عدم الرد عليها.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
