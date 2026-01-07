'use strict';

window.jsPDF = window.jspdf.jsPDF

let inputForm;
let submitForm;

let secretEntered = false;

const API = 'https://invoice-emailer-x6q92.ondigitalocean.app';
// const API = 'https://localhost:3000';

let alerts = '';


window.addEventListener('load', (_) => {
  inputForm = document.getElementById('invoice_form');

  submitForm = document.getElementById('send_form');
  submitForm.addEventListener('submit', generatePdf);

  document.getElementById('tank_selector').addEventListener('change', onTankChange);
  document.getElementById('tank_brand').addEventListener('input', onBrandChange);
  document.getElementById('tank_cost').addEventListener('input', onTankCostChange);

  document.getElementById('customer_name').addEventListener('input', onCustomerNameChange);
  document.getElementById('customer_email').addEventListener('input', onCustomerEmailChange);
  document.getElementById('customer_address').addEventListener('input', onCustomerPhoneChange);

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

  setInterval(getSnsStream, 1500);
});


const getSnsStream = () => {
  fetch(`${API}/snsstream`, {
    method: 'GET'
  })
  .then((r) => {
    return r.json();
  })
  .then((r) => {
    for(const e of r.events) {
      console.log(e);
      alerts = `<p>${e}</p>` + alerts;
    }

    if(r.events.length !== 0)
      updateAlerts();
  });
};

const updateAlerts = () => {
  if(alerts === '') return;

  const alertsEl = document.getElementById('alerts');
  const alertsBox = document.getElementById('alert_section');

  alertsEl.innerHTML = alerts;

  const alertNodes = alertsEl.children;

  if(alertNodes.length === 0)
    alertsBox.style = 'background-color: slateblue';
  else if(alertNodes.length === 1) {
    if(alertNodes[0].textContent === 'Email Delivered!') {
      alertsBox.style = 'background-color: darkgreen';
    } else {
      alertsBox.style = 'background-color: red';
    }
  } else {
    alertsBox.style = 'background-color: red';
  }

}


const getDateTime = (extraDays = 0) => {
  const today = new Date();
  today.setDate(today.getDate() + extraDays);
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const dateString = mm + '/' + dd + '/' + yyyy;

  return [dateString, today.toTimeString()];
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

const onBrandChange = (e) => {
  document.getElementById('table_tank_brand').textContent = e.target.value;
}

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
  // document.getElementById('bill_to_email').textContent = e.target.value;
}

const onCustomerPhoneChange = (e) => {
  e.preventDefault();
  document.getElementById('bill_to_address').textContent = e.target.value;
}

const onReviewChange = (e) => {
  e.preventDefault();
  document.getElementById('table_discount_row').style = `display: ${e.target.checked ? 'flex' : 'none'};`

  calcAndUpdateTotal();
}


const calcAndUpdateTotal = () => {
  const total = Number(document.getElementById('tank_cost').value);
  
  document.getElementById('total_cost_preview').textContent = total;
  document.getElementById('table_total_text').textContent = total;
  document.getElementById('table_paid_text').textContent = total;
}


const initFillPdf = () => {
  document.getElementById('bill_to_name').textContent = document.getElementById('customer_name').value;
  // document.getElementById('bill_to_email').textContent = document.getElementById('customer_email').value;
  document.getElementById('bill_to_address').textContent = document.getElementById('customer_address').value;

  document.getElementById('table_tank_size').textContent = document.getElementById('tank_selector').value;
  document.getElementById('table_service_cost').textContent = document.getElementById('tank_cost').value;

  calcAndUpdateTotal();
};



const generatePdf = (e) => {
  e.preventDefault();

  alerts = '';
  updateAlerts();
  document.getElementById('alerts').innerHTML = '<p>Please wait...</p>';
  document.getElementById('alert_section').style = 'background-color: slateblue';
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
      data.append('pw', document.getElementById('pw').value);
      data.append('name', document.getElementById('customer_name').value);
      data.append('date', getDateTime()[0]);
      data.append('dueDate', getDateTime(14)[0]);
      data.append('totalDue', document.getElementById('table_total_text').textContent);
      data.append('recipient', document.getElementById('customer_email').value);

      fetch(`${API}/invoice`, {
        method: 'POST',
        body: data,
      })
      .then((res) => {
        return res.text();
      })
      .then((res) => { 
        document.getElementById('send_email_button').value = 'Sent';

        let alert = '';
        
        if(res === 'Unauthorized') 
        {
          alert = 'Incorrect password';
        }

        if(alert !== '')
          alerts = `<p>${alert}</p>` + alerts;

        updateAlerts();

        setTimeout(() => document.getElementById('send_email_button').value = 'Send Email', 3000);
      }).catch((e) => {
        document.getElementById('send_email_button').value = 'Something went wrong...';

        console.log(e);

        setTimeout(() => document.getElementById('send_email_button').value = 'Send Email', 3000);
      });
    },
    width: 8.5,
    windowWidth: 710,
  });


}