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

console.log(process.env.USER_ID)
console.log(process.env.USER_KEY)

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/invoice', (req, res) => {
  const form = new multiparty.Form();


  form.parse(req, (err, fields, files) => {
    console.log(fields);
    console.log(files);

    const pdfPath = files['pdf'][0].path;

    transporter.sendMail({
      from: '"Dave" <dave@qualitywaterheaterservice.com>',
      to: 'smartsitewebdev@gmail.com',
      subject: 'Hello',
      text: 'Hello there',
      attachments: [
        {
          filename: 'invoice.pdf',
          path: pdfPath
        }
      ]
    }).then(() => {
      console.log('Email sent');
      res.send('ping!');
    });
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
