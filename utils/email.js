const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // create a transpoter
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "26de1409386d4f",
      pass: "5debfde3276b2e",
    },
  });

  // actually send the email
  await transporter.sendMail(options);
};

module.exports = sendEmail;
