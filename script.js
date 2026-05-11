type="module"
  src="https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module"

function scanWifi() {
    const list = document.getElementById('wifi-list');
    const btn = document.querySelector('.btn-scan');
    const btnText = btn.querySelector('span');
    
    list.style.display = 'none';
    btnText.innerText = "Scanning...";
    btn.classList.add('scanning');
    btn.disabled = true;
    
    fetch('/scan').then(res => res.json()).then(data => {
      list.innerHTML = '';
      btnText.innerText = "Scan for Networks";
      btn.classList.remove('scanning');
      btn.disabled = false;
      
      list.style.display = 'block';
      data.forEach(net => {
        const div = document.createElement('div');
        div.className = 'wifi-item';
        div.innerHTML = `<span>${net.ssid}</span> <small>${net.rssi} dBm</small>`;
        div.onclick = () => { document.getElementById('ssid').value = net.ssid; list.style.display='none'; };
        list.appendChild(div);
      });
    })
    .catch(err => {
      btnText.innerText = "Scan Failed";
      btn.classList.remove('scanning');
      btn.disabled = false;
    });
  }

  function togglePassword() {
    const passInput = document.getElementById('pass');
    const toggleBtn = document.querySelector('.toggle-password');
    if (passInput.type === 'password') {
      passInput.type = 'text';
      toggleBtn.textContent = 'Hide';
    } else {
      passInput.type = 'password';
      toggleBtn.textContent = 'Show';
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const overlay = document.getElementById('overlay');
    const loading = document.getElementById('loading-ui');
    const success = document.getElementById('success-ui');
    const error = document.getElementById('error-ui');
    
    // Reset UI
    overlay.classList.add('active');
    loading.style.display = 'block';
    success.style.display = 'none';
    error.style.display = 'none';

    // Submit Form
    const formData = new FormData(document.getElementById('config-form'));
    const params = new URLSearchParams(formData);


    fetch('/save', { method: 'POST', body: params })
      .then(res => res.json())
      .then(data => {
        if(data.status === 'connected') {
          document.getElementById('loading-ui').style.display = 'none';
          document.getElementById('success-ui').style.display = 'block';
        }
      });
  }

  function pollStatus() {
    // Check every 1 second
    const interval = setInterval(() => {
      fetch('/check_connect')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'connected') {
            clearInterval(interval);
            document.getElementById('loading-ui').style.display = 'none';
            document.getElementById('success-ui').style.display = 'block';
          } else if (data.status === 'failed') {
            clearInterval(interval);
            document.getElementById('loading-ui').style.display = 'none';
            document.getElementById('error-ui').style.display = 'block';
          }
        })
        .catch(err => {
           // If fetch fails (maybe ESP rebooted?), assume success or stop polling
           // clearInterval(interval);
        });
    }, 1000);
  }

  function closeOverlay() {
    document.getElementById('overlay').classList.remove('active');
  }
