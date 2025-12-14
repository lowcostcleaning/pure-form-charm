// Webhook URL - define your endpoint here
const WEBHOOK_URL = '';

// Password for the gate (change this to your desired password)
const SITE_PASSWORD = 'demo123';

// DOM Elements
const passwordGate = document.getElementById('password-gate');
const passwordInput = document.getElementById('password-input');
const passwordSubmit = document.getElementById('password-submit');
const passwordError = document.getElementById('password-error');
const mainContent = document.getElementById('main-content');
const formOne = document.getElementById('form-one');
const formTwo = document.getElementById('form-two');

// Password Gate Logic
function checkPassword() {
  const entered = passwordInput.value;
  
  if (entered === SITE_PASSWORD) {
    passwordGate.classList.add('hidden');
    mainContent.classList.remove('hidden');
    passwordError.textContent = '';
  } else {
    passwordError.textContent = 'Incorrect password. Please try again.';
    passwordInput.value = '';
    passwordInput.focus();
  }
}

passwordSubmit.addEventListener('click', checkPassword);

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    checkPassword();
  }
});

// Form Submission Logic
async function submitForm(form, formName) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  // Add metadata
  data.formName = formName;
  data.submittedAt = new Date().toISOString();
  
  // Remove any existing status messages
  const existingStatus = form.querySelector('.form-success, .form-error');
  if (existingStatus) {
    existingStatus.remove();
  }
  
  // If webhook URL is empty, log to console
  if (!WEBHOOK_URL) {
    console.log(`[${formName}] Form submitted:`, data);
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'form-success';
    statusDiv.textContent = 'Submitted! (logged to console)';
    form.appendChild(statusDiv);
    form.reset();
    
    setTimeout(() => {
      statusDiv.remove();
    }, 3000);
    return;
  }
  
  // Disable submit button while sending
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const statusDiv = document.createElement('div');
    
    if (response.ok) {
      statusDiv.className = 'form-success';
      statusDiv.textContent = 'Submitted successfully!';
      form.reset();
    } else {
      statusDiv.className = 'form-error';
      statusDiv.textContent = 'Submission failed. Please try again.';
    }
    
    form.appendChild(statusDiv);
    
    setTimeout(() => {
      statusDiv.remove();
    }, 5000);
    
  } catch (error) {
    console.error('Submission error:', error);
    const statusDiv = document.createElement('div');
    statusDiv.className = 'form-error';
    statusDiv.textContent = 'Network error. Please check your connection.';
    form.appendChild(statusDiv);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Form Event Listeners
formOne.addEventListener('submit', (e) => {
  e.preventDefault();
  submitForm(formOne, 'Cleaning Request');
});

formTwo.addEventListener('submit', (e) => {
  e.preventDefault();
  submitForm(formTwo, 'Manager Report');
});
