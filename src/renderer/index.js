const form = document.getElementById('customerForm');
const result = document.getElementById('result');
const resultsDiv = document.getElementById('results');
const searchBox = document.getElementById('searchBox');
const formTitle = document.getElementById('formTitle');
const recordId = document.getElementById('recordId');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveBtn = document.getElementById('saveBtn');

let editing = false;

async function loadCustomers(searchTerm = "") {
  const customers = await window.api.getCustomers(searchTerm);
  renderCustomers(customers);
}

function renderCustomers(customers) {
  if (!customers || customers.length === 0) {
    resultsDiv.innerHTML = "<p>No records found.</p>";
    return;
  }
  let html = `<table>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>Service</th>
      <th>Details</th>
      <th>Created</th>
      <th>Actions</th>
    </tr>`;
  for (const c of customers) {
    html += `<tr>
      <td>${escapeHTML(c.name)}</td>
      <td>${escapeHTML(c.email)}</td>
      <td>${escapeHTML(c.phone)}</td>
      <td>${escapeHTML(c.service)}</td>
      <td>${escapeHTML(c.details)}</td>
      <td>${new Date(c.created_at).toLocaleString()}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${c.id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${c.id}">Delete</button>
      </td>
    </tr>`;
  }
  html += `</table>`;
  resultsDiv.innerHTML = html;

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => startEdit(btn.getAttribute('data-id'));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => confirmDelete(btn.getAttribute('data-id'));
  });
}

async function startEdit(id) {
  editing = true;
  formTitle.textContent = "Edit Customer & Service Details";
  cancelEditBtn.style.display = "";
  saveBtn.textContent = "Update";
  result.textContent = "";

  const c = await window.api.getCustomer(Number(id));
  if (c) {
    recordId.value = c.id;
    document.getElementById('name').value = c.name;
    document.getElementById('email').value = c.email;
    document.getElementById('phone').value = c.phone;
    document.getElementById('service').value = c.service;
    document.getElementById('details').value = c.details;
    setTimeout(() => {
      document.getElementById('name').focus();
    }, 50);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function resetForm() {
  editing = false;
  form.reset();
  recordId.value = "";

  formTitle.textContent = "Add Customer & Service Details";
  cancelEditBtn.style.display = "none";
  saveBtn.textContent = "Save";
  result.textContent = "";

  setTimeout(() => {
    const nameInput = document.getElementById('name');
    nameInput.focus();
    nameInput.select();
  }, 100);
}

cancelEditBtn.onclick = resetForm;

function showCustomConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customConfirm');
    document.getElementById('customConfirmMsg').textContent = message;
    modal.style.display = 'flex';

    const yesBtn = document.getElementById('customConfirmYes');
    const noBtn = document.getElementById('customConfirmNo');
    yesBtn.focus();

    function cleanup(result) {
      modal.style.display = 'none';
      yesBtn.removeEventListener('click', yesHandler);
      noBtn.removeEventListener('click', noHandler);
      document.removeEventListener('keydown', keyHandler);
      resolve(result);
    }
    function yesHandler() { cleanup(true); }
    function noHandler() { cleanup(false); }

    yesBtn.addEventListener('click', yesHandler);
    noBtn.addEventListener('click', noHandler);

    function keyHandler(e) {
      if (e.key === 'Escape') {
        cleanup(false);
      }
      if (e.key === 'Enter' && document.activeElement === yesBtn) {
        cleanup(true);
      }
      if (e.key === 'Enter' && document.activeElement === noBtn) {
        cleanup(false);
      }
    }
    document.addEventListener('keydown', keyHandler);
  });
}

async function confirmDelete(id) {
  const doDelete = await showCustomConfirm("Are you sure you want to delete this record?");
  setTimeout(() => {
    const nameInput = document.getElementById('name');
    nameInput.focus();
    nameInput.select();
  }, 100);
  if (doDelete) {
    await window.api.deleteCustomer(Number(id));
    result.textContent = "Record deleted.";
    resetForm();
    await loadCustomers(searchBox.value);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    id: recordId.value ? Number(recordId.value) : undefined,
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    service: document.getElementById('service').value.trim(),
    details: document.getElementById('details').value.trim()
  };
  if (!data.name || !data.email || !data.phone || !data.service) {
    result.textContent = "Please fill in all required fields.";
    setTimeout(() => result.textContent = '', 2000);
    return;
  }
  const res = await window.api.saveCustomer(data);
  if (res && res.success) {
    result.textContent = res.updated ? 'Record updated!' : 'Saved!';
    resetForm();
    await loadCustomers(searchBox.value);
  } else {
    result.textContent = 'Error saving data.';
  }
  setTimeout(() => result.textContent = '', 2000);
});

searchBox.addEventListener('input', async (e) => {
  await loadCustomers(e.target.value);
});

function escapeHTML(str) {
  return (str || '').replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    })[s];
  });
}

loadCustomers();