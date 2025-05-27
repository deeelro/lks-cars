const nodemailer = require('nodemailer'); 
const pug = require('pug'); // Para renderizar plantillas html
const htmlToText = require('html-to-text'); // Para convertir html a texto plano


module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ivan del Rio <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Si el entorno es de produccion, se usa BREVO
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD
        },
      });
    }

    // Si no, se usa Gmail
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  async send(template, subject) {
    // renderizar HTML a partir de una plantilla pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // Definiciones de las opciones del email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText.convert(html),      
      html
    };

    // Enviar el email con las opciones como parametro
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Bienvenido a la comunidad de LKS Cars');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Recupera tu contraseña (valido solo 10 minutos)'
    );
  }


/////////////////////////////////////////////////////
// Envio de la factura de compra al cliente
/////////////////////////////////////////////////////
async sendPurchaseTicket({ sale, car, user, pdfBuffer }) {
  const html = pug.renderFile(`${__dirname}/../views/email/purchaseTicket.pug`, {
    firstName: user.name.split(' ')[0],
    sale,
    car
  });

  const mailOptions = {
    from: this.from,
    to: user.email,
    subject: 'Tu factura de compra',
    html,
    text: htmlToText.convert(html),
    attachments: [
      {
        filename: 'factura.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await this.newTransport().sendMail(mailOptions);
}
};





/* const sendEmail = async options => {
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
 */