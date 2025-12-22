const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const multiparty = require('multiparty');
const port = 3000;

const { sendInvoice, SnsStream } = require('./email');
const { hashAndVerify } = require('./auth');

app.use(cors());

const jsonParser = bodyParser.json();
const snsStream = new SnsStream();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/invoice', (req, res) => {
  console.log('POST /invoice');

  new multiparty.Form().parse(req, (err, fields, files) => {
    if(err) {
      console.log('Bad form');

      res.status(400);
      res.header('content-type', 'text/plain');
      res.send('Bad form construction');
      return;
    }


    const getField = (name) => fields[name][0];

    const pdfPath = files['pdf'][0].path;
    const name = getField('name');
    const date = getField('date');
    const dueDate = getField('dueDate');
    const totalDue = getField('totalDue');
    const recipient = getField('recipient');
    const pw = getField('pw');


    if(!hashAndVerify(pw))
    {
      console.log('Bad Password');

      res.status(401);
      res.header('content-type', 'text/plain');
      res.send('Unauthorized');
      return;
    }

    sendInvoice(recipient, name, date, dueDate, totalDue, pdfPath)
    .then((_) => {
      console.log(`Email sent: ${recipient}`);
      res.header('content-type', 'text/plain');
      res.send('Okay');
    })
    .catch((r) => {
      console.log('Send Error: ', r.toString());
      res.status(400);
      res.header('content-type', 'text/plain');
      res.send(r.toString());
    });
  });
})

app.post('/sns', jsonParser, (req, res) => {
  console.log('POST /sns')
  
  const body = req.body;
  snsStream.push(body);
  // console.log(JSON.stringify(body));
  console.log(SnsStream.formatEvent(body));
});

app.get('/snsstream', (_, res) => {
  const stream = snsStream.consume();
  stream.map((b) => SnsStream.formatEvent(b));

  res.status(200);
  res.header('content-type', 'application/json');
  res.send(JSON.stringify({'events': stream}));
});

app.listen(port, () => {
  console.log(`Application starting on port ${port}`)
})
