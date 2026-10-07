// Sends the password-reset code. Without SMTP_URL the code is printed in the server console (demo mode).
export const mailConfigured = () => !!process.env.SMTP_URL

export async function sendResetMail(to, code) {
  if (!mailConfigured()) { console.log(`[reset] code for ${to}: ${code} (valid 10 minutes)`); return }
  const { default: nodemailer } = await import('nodemailer')
  await nodemailer.createTransport(process.env.SMTP_URL).sendMail({
    from: process.env.MAIL_FROM || 'CartWise <no-reply@localhost>',
    to,
    subject: 'Your CartWise password reset code',
    text: `Your CartWise reset code is ${code}. It expires in 10 minutes. If you did not ask for this, you can ignore this email.`,
  })
}
