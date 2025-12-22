const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-west-1.amazonaws.com',
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
        subject: `Invoice for Water Heater Service- Due ${dueDate}`,
        text: 
`Dear ${name},

I am reaching out to provide the invoice for servicing your water heater on ${date}. Below is a summary of the invoice:

Date Issued: ${date}
Due Date: ${dueDate}
Total Amount: $${totalDue}

For your records, a PDF version of this invoice is also attached.

Please mail your check to 1064 Reed St, Santa Clara, CA 95050 and make it payable to Quality Water Heater Service. If you've already paid, feel free to disregard this email. 

Thank you for choosing Quality Water Heater Service. Should you have any questions, please call me at (408)-679-5820.

Best,
Dave Kessler

* This is a one-time transactional email. You are not signed up for any marketing emails nor are on any emailing lists.
** Please do not respond to this email. This account's inbox is not monitored.
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
    this.#stream.push(body);
  }


  consume() {
    const streamCopy = [...this.#stream];
    this.#stream = [];
    return streamCopy;
  }

  static formatEvent(body) {
    const eventType = body.eventType;

    let sendString = '';

    if(eventType === 'Bounce') {
      sendString = body.bounce.bounceType;
      sendString += ' Bounce:\n';

      for(const r of body.bounce.bouncedRecipients) {
        sendString += `\tRecipient: ${r.emailAddress}\n`
        sendString += `\tCode: ${r.diagnosticCode}\n`
      }
      sendString += `At ${body.bounce.timestamp}`;
    } else if(eventType === 'Complaint') {
      sendString += 'Complaint: \n';

      for(const r of body.bounce.complainedRecipients) {
        sendString += `\tRecipient: ${r.emailAddress}\n`
      }
      sendString += `At ${body.bounce.timestamp}`;
    }

    return sendString;
  }
}






module.exports = {
  sendInvoice,
  SnsStream,
}