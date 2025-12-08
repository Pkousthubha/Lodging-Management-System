// mailer.js
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendResetOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: '"Lodging Cloud" <no-reply@lodgingcloud.com>',
    to: toEmail,
    subject: "Your password reset code",
    text: `Use this OTP to reset your password: ${otp}`,
  })
}