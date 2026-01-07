const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: process.env.USER_ID,
        pass: process.env.USER_KEY
    }
});



function sendInvoice(recipient, name, date, dueDate, totalDue, filePath) {
  return transporter.sendMail({
        from: '"Quality Water Heater Service" <dave@qualitywaterheaterservice.com>',
        to: `${recipient}`,
        subject: `Invoice - Receipt for Water Heater Service- ${dueDate}`,
        html: 
`<p>Dear ${name},</p>

<p>I am reaching out to provide the invoice-receipt for servicing your water heater on ${date}. Below is a summary: </p>

<p>
Date Issued: ${date} <br>
Total Paid: ${totalDue}
</p>

<p>
For your records, a PDF version of this invoice-receipt is also attached.
</p>

<p>
Thank you for choosing Quality Water Heater Service. Should you have any questions, please call me at <a href="tel:4086795820"> (408)-679-5820 </a>
or contact Kris Rose (Operations Manager):
</p>

<a href="tel:4083947477"> Cell: 408-394-7477 </a> <br>
<a href="mailto:rosemgt2020@yahoo.com"> rosemgt2020@yahoo.com </a> <br>

<p> We appreciate your business! </p>

<p>
Best, <br>
Dave Kessler
</p>
<p>
* This is a one-time transactional email. You are not signed up for any marketing emails nor are on any emailing lists. <br>
** Please do not respond to this email. This account's inbox is not monitored.
</p>
`
        ,
        attachments: [
          {
            filename: 'invoice.pdf',
            path: filePath
          }
        ],
        headers: {
          'X-SES-CONFIGURATION-SET': 'waterHeater',
        },
  });
}


class SnsStream {

  #stream;

  constructor() {
    this.#stream = [];
  }

  push(body) {
    this.#stream = body.concat(this.#stream);
  }


  consume() {
    const streamCopy = [...this.#stream];
    this.#stream = [];
    return streamCopy;
  }

  static formatEvent(event) {
    const email = event.email;
    const eventName = event.event;

    if(eventName === 'delivered') {
      return `Email Delivered!`;
    } else if(eventName === 'bounce') {
      return `Could not send to ${email} (most likely it doesn't exist). Please ask for a different address or check your spelling.`
    } else if(eventName === 'deferred') {
      return `Please defer sending to ${email} (try again later)`;
    } else if(eventName === 'dropped') {
      return `Email provider dropped the message to ${email}. Please ask for a different address or check your spelling.`
    } else if(eventName === 'processed') {
      return `Message to ${email} processed`;
    } else {
      // Should never be here
    }
  }
}






module.exports = {
  sendInvoice,
  SnsStream,
}