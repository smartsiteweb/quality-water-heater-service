'use strict';

window.jsPDF = window.jspdf.jsPDF

let inputForm;
let submitForm;

let secretEntered = false;

window.addEventListener('load', (_) => {
  inputForm = document.getElementById('invoice_form');

  submitForm = document.getElementById('send_form');
  submitForm.addEventListener('submit', generatePdf);

  document.getElementById('tank_selector').addEventListener('change', onTankChange);
  document.getElementById('tank_cost').addEventListener('input', onTankCostChange);

  document.getElementById('customer_name').addEventListener('input', onCustomerNameChange);
  document.getElementById('customer_email').addEventListener('input', onCustomerEmailChange);
  document.getElementById('customer_phone').addEventListener('input', onCustomerPhoneChange);

  document.getElementById('review').addEventListener('change', onReviewChange);

  // const downloadButton = document.getElementById('download_button');
  // downloadButton.addEventListener('click', generatePdf);
  // downloadButton.disabled = true;

  // while(1) {
  //   const response = prompt('Enter Secret:');

  //   if(response === 'dave') {
  //     secretEntered = true;
  //     break;
  //   }
  // }


  // Get today's date
  setDateTime();
  initFillPdf();
});


const getDateTime = (extraDays = 0) => {
  const today = new Date();
  today.setDate(today.getDate() + extraDays);
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const dateString = mm + '/' + dd + '/' + yyyy;

  return [dateString, today.toTimeString];
}


const setDateTime = () => {
  const [date, time] = getDateTime();

  document.getElementById('date').textContent = date;
  document.getElementById('gen_date').textContent = date;
  document.getElementById('gen_time').textContent = time;
};


const onTankChange = (e) => {
  const costMap = {
    "30": 1600,
    "40": 1800,
    "50": 1900,
    "60": 2000,
    "75": 2400
  };

  e.preventDefault();

  const tankSize = e.target.value;
  const tankCost = costMap[tankSize];

  document.getElementById('table_tank_size').textContent = tankSize;
  document.getElementById('tank_cost').value = tankCost;
  document.getElementById('table_service_cost').textContent = tankCost;
  calcAndUpdateTotal();
};

const onTankCostChange = (e) => {
  e.preventDefault();
  document.getElementById('table_service_cost').textContent = e.target.value;
  calcAndUpdateTotal();
}

const onCustomerNameChange = (e) => {
  e.preventDefault();
  document.getElementById('bill_to_name').textContent = e.target.value;
}

const onCustomerEmailChange = (e) => {
  e.preventDefault();
  document.getElementById('bill_to_email').textContent = e.target.value;
}

const onCustomerPhoneChange = (e) => {
  e.preventDefault();
  document.getElementById('bill_to_phone').textContent = e.target.value;
}

const onReviewChange = (e) => {
  e.preventDefault();
  document.getElementById('table_discount_row').style = `display: ${e.target.checked ? 'flex' : 'none'};`

  calcAndUpdateTotal();
}


const calcAndUpdateTotal = () => {
  const total = Number(document.getElementById('tank_cost').value) - 
    (document.getElementById('review').checked ? 50 : 0);
  
  document.getElementById('total_cost_preview').textContent = total;
  document.getElementById('table_total_text').textContent = total;
}


const initFillPdf = () => {
  document.getElementById('bill_to_name').textContent = document.getElementById('customer_name').value;
  document.getElementById('bill_to_email').textContent = document.getElementById('customer_email').value;
  document.getElementById('bill_to_phone').textContent = document.getElementById('customer_phone').value;

  document.getElementById('table_tank_size').textContent = document.getElementById('tank_selector').value;
  document.getElementById('table_service_cost').textContent = document.getElementById('tank_cost').value;

  document.getElementById('table_discount_row').style = `display: ${document.getElementById('review').checked ? 'flex' : 'none'};`

  calcAndUpdateTotal();
};



const generatePdf = (e) => {
  e.preventDefault();

  document.getElementById('send_email_button').value = 'Sending...';

  const doc = new jsPDF({
    unit: 'in',
    format: 'letter',
  });


  const invoiceEl = document.getElementById('generated_invoice');
  const invoiceBorder = document.getElementById('invoice-border');

  invoiceBorder.style['transform'] = 'scale(1)';

  doc.html(invoiceEl, {
    callback: function (doc) {
      // doc.save();

      const blob = doc.output('blob');

      let data = new FormData();
      data.append('pdf', blob);
      data.append('pw', 'dave');
      data.append('name', document.getElementById('customer_name').value);
      data.append('date', getDateTime()[0]);
      data.append('dueDate', getDateTime(14)[0]);
      data.append('totalDue', document.getElementById('table_total_text').textContent);

      console.log(data);


      const API = 'https://invoice-emailer-x6q92.ondigitalocean.app/invoice';
      // const API = 'http://localhost:3000/invoice';

      fetch(API, {
        method: 'POST',
        body: data,
      }).then(() => { 
        document.getElementById('send_email_button').value = 'Success!';

        setTimeout(() => document.getElementById('send_email_button').value = 'Send Email', 3000);
      }).catch(() => {
        document.getElementById('send_email_button').value = 'Something went wrong...';

        setTimeout(() => document.getElementById('send_email_button').value = 'Send Email', 3000);
      });
    },
    width: 8.5,
    windowWidth: 750,
  });


}