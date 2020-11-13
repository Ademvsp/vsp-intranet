const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

module.exports = class Email {
  constructor({ from, to, bcc, subject, html }) {
    this.from = from;
    this.to = to;
    this.bcc = bcc;
    this.subject = subject;
    this.html = html;
  }

  async send() {
    await transporter.sendMail({
      from: this.from,
      to: this.to,
      bcc: this.bcc,
      subject: this.subject,
      html: this.html
    });
  }
};
