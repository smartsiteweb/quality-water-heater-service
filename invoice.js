'use strict';

window.jsPDF = window.jspdf.jsPDF

let form;

let secretEntered = false;

window.addEventListener('load', (_) => {
  form = document.getElementById('invoice_form');
  form.addEventListener('submit', buildPdf);

  const downloadButton = document.getElementById('download_button');
  downloadButton.addEventListener('click', generatePdf);
  downloadButton.disabled = true;

  while(1) {
    const response = prompt('Enter Secret:');

    if(response === 'dave') {
      secretEntered = true;
      break;
    }
  }


});


const buildPdf = (e) => {
  e.preventDefault();
  
  let data = {};

  for(const [key, value] of new FormData(form)) {
    data[key] = value;
  }
 

  document.getElementById('bill_to_name').textContent = data['customer_name'];
  document.getElementById('table_service_name').textContent = data['water_boiler'];
  document.getElementById('table_service_cost').textContent = data['total_cost'];


  // Get today's date
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const dateString = mm + '/' + dd + '/' + yyyy;

  document.getElementById('date').textContent = dateString;
  document.getElementById('gen_date').textContent = dateString;
  document.getElementById('gen_time').textContent = today.toTimeString();

  document.getElementById('download_button').disabled = false && secretEntered;
};


const generatePdf = (e) => {
  e.preventDefault();

  const doc = new jsPDF({
    unit: 'in',
    format: 'letter'
  });


  const invoiceEl = document.getElementById('generated_invoice');
  const invoiceBorder = document.getElementById('invoice-border');

  invoiceBorder.style['transform'] = 'scale(1)';

  doc.html(invoiceEl, {
    callback: function (doc) {

      const blob = doc.output('blob');

      let data = new FormData();
      data.append('pdf', blob);
      data.append('pw', 'dave');

      console.log(data);


      fetch('https://invoice-emailer-x6q92.ondigitalocean.app/invoice', {
        method: 'POST',
        body: data,
      }).then(() => { console.log('yippee') });




      invoiceBorder.style['transform'] = 'scale(.5)';
    },
    width: 8.5,
    windowWidth: 800,
  });


}