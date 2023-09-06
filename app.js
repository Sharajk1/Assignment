const apiUrl = 'https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp';
let bearerToken = '';

function handleLogin(event) {
  event.preventDefault();

  const loginId = document.getElementById('loginId').value;
  const password = document.getElementById('password').value;


  fetch('https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp', {
    method: 'POST',
    body: JSON.stringify({ login_id: loginId, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        console.error('Login failed. Status:', response.status, response.statusText);
        alert('Invalid login credentials');
        throw new Error('Login failed');
      }
    })
    .then((data) => {
      bearerToken = data.token;
      showCustomerListScreen();
    })
    .catch((error) => {
      console.error(error);
      alert('Login failed');
    });
}


function loadCustomerList() {

  fetch(`${apiUrl}?cmd=get_customer_list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error('Unable to retrieve customer list');
      }
    })
    .then((data) => {
      const customerTableBody = document.getElementById('customerTableBody');
      customerTableBody.innerHTML = '';

      data.forEach((customer) => {
        const { first_name, last_name, address, email, phone } = customer;

        const row = `
          <tr>
            <td>${first_name}</td>
            <td>${last_name}</td>
            <td>${address}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>
              <button onclick="deleteCustomer('${customer.uuid}')">Delete</button>
              <button onclick="showUpdateCustomerScreen('${customer.uuid}')">Update</button>
            </td>
          </tr>
        `;

        customerTableBody.insertAdjacentHTML('beforeend', row);
      });
    })
    .catch((error) => {
      console.error(error);
      alert('Unable to retrieve customer list');
    });
}


function handleAddCustomer(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const street = document.getElementById('street').value;
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;


  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      cmd: 'create',
      first_name: firstName,
      last_name: lastName,
      street,
      address,
      city,
      state,
      email,
      phone,
    }),
  })
    .then((response) => {
      if (response.status === 201) {
        loadCustomerList();
        alert('Customer created successfully');
      } else if (response.status === 400) {
        throw new Error('First Name or Last Name is missing');
      }
    })
    .catch((error) => {
      console.error(error);
      alert('Unable to add customer');
    });
}


function deleteCustomer(uuid) {
  if (confirm('Are you sure you want to delete this customer?')) {
  
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({ cmd: 'delete', uuid: uuid }),
    })
      .then((response) => {
        if (response.status === 200) {
          loadCustomerList();
        } else if (response.status === 400) {
          throw new Error('Customer not found');
        }
      })
      .catch((error) => {
        console.error(error);
        alert('Unable to delete customer');
      });
  }
}


function showUpdateCustomerScreen(uuid) {

  fetch(`${apiUrl}?cmd=get_customer_details&id=${uuid}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 404) {
        throw new Error('Customer not found');
      }
    })
    .then((data) => {
      
      document.getElementById('updateFirstName').value = data.first_name;
      document.getElementById('updateLastName').value = data.last_name;
      document.getElementById('updateStreet').value = data.street;
      document.getElementById('updateAddress').value = data.address;
      document.getElementById('updateCity').value = data.city;
      document.getElementById('updateState').value = data.state;
      document.getElementById('updateEmail').value = data.email;
      document.getElementById('updatePhone').value = data.phone;

  
      document.getElementById('customerListScreen').style.display = 'none';
      document.getElementById('updateCustomerScreen').style.display = 'block';
    })
    .catch((error) => {
      console.error(error);
      alert('Unable to retrieve customer details');
    });
}


function handleUpdateCustomer(event) {
  event.preventDefault();

  const id = document.getElementById('customerId').value;
  const first_name = document.getElementById('updateFirstName').value;
  const last_name = document.getElementById('updateLastName').value;
  const street = document.getElementById('updateStreet').value;
  const address = document.getElementById('updateAddress').value;
  const city = document.getElementById('updateCity').value;
  const state = document.getElementById('updateState').value;
  const email = document.getElementById('updateEmail').value;
  const phone = document.getElementById('updatePhone').value;

 
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      cmd: 'update',
      uuid: id, 
      first_name,
      last_name,
      street,
      address,
      city,
      state,
      email,
      phone,
    }),
  })
    .then((response) => {
      if (response.status === 200) {
        loadCustomerList();
        alert('Customer updated successfully');
      } else if (response.status === 400) {
        throw new Error('Customer not found');
      }
    })
    .catch((error) => {
      console.error(error);
      alert('Unable to update customer');
    });
}


function showCustomerListScreen() {
  loadCustomerList();
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('customerListScreen').style.display = 'block';
}


document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('addCustomerForm').addEventListener('submit', handleAddCustomer);
document.getElementById('updateCustomerForm').addEventListener('submit', handleUpdateCustomer);
document.getElementById('addCustomerBtn').addEventListener('click', () => {
  document.getElementById('customerListScreen').style.display = 'none';
  document.getElementById('addCustomerScreen').style.display = 'block';
});
