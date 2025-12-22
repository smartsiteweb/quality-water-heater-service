const express = require('express');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const port = 3000;


const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-west-1.amazonaws.com',
    port: 587,
    auth: {
        user: process.env.USER_ID,
        pass: process.env.USER_KEY
    }
});

// console.log(process.env.USER_ID)
// console.log(process.env.USER_KEY)

app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static('public'));

const jsonParser = bodyParser.json();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/invoice', (req, res) => {
  const form = new multiparty.Form();


  form.parse(req, (err, fields, files) => {
    console.log(fields);
    console.log(files);

    const pdfPath = files['pdf'][0].path;
    const name = fields['name'][0];
    const date = fields['date'][0];
    const dueDate = fields['dueDate'][0];
    const totalDue = fields['totalDue'][0];
    const recipient = fields['recipient'][0];

    transporter.sendMail({
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
          path: pdfPath
        }
      ],
      headers: {
        'X-SES-CONFIGURATION-SET': 'waterHeater',
      },
    }).then((r) => {
      console.log('Email sent');

      console.log(r);
      res.send('ping!');
    });
  });
})

app.post('/sns', jsonParser, (req, res) => {
  const body = req.body;
  
  console.log('Email Bounce:');
  for(r in body['bouncedRecipients']) {
    console.log('Recipient: ', r.emailAddress);
    console.log('Code: ', r.diagnosticCode);
  }

  console.log();
});


// app.all('/sns', (req, res) => {
//   console.log('any');
//   console.log(req);
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
