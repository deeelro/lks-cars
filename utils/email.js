const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Creo un transportador
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Definiciones de las opciones del email
  const mailOptions = {
    from: 'Ivan del Rio <ivan@deelro.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Enviar el email con las opciones como parametro
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
