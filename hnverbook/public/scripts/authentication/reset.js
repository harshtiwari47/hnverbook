'use strict'
document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
   document.getElementById('resetPassword').addEventListener('submit', async (e) => {
      e.preventDefault();
      const actionButton = document.getElementById('actionBtn');
      actionButton.disabled = true;
      const loginBtnPrevVal = actionButton.value;
      actionButton.value = "Please Wait";

      const formData = {};

      if (event.target.email) {
         formData.email = event.target.email.value
      } else {
         formData.password = event.target.password.value
      }

      const url = e.target.action;

      const response = await fetch(url, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         if (url === "/account/reset-password/confirm") {
            document.getElementById('error-message').style.display = "block";
            document.getElementById('error-message').classList.add('success');
            document.getElementById('error-message').textContent = result.message;
            actionButton.style.display = "none";
         } else {
            document.getElementById('error-message').style.display = "block";
            document.getElementById('error-message').classList.add('success');
            document.getElementById('error-message').textContent = result.message;
            actionButton.style.display = "none";
         }
      } else {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = result.message;
         actionButton.disabled = false;
         actionButton.value = loginBtnPrevVal;
      }
   })
});