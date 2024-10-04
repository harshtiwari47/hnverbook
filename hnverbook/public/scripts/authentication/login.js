'use strict'
document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
   document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const loginButton = document.getElementById('loginButton');
      loginButton.disabled = true;
      loginButton.value = "Please Wait";

      const formData = {
         email: event.target.email.value,
         password: event.target.password.value,
      };
      const response = await fetch('/auth/login', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         window.location.href = "/";
      } else {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = result.message;
         loginButton.disabled = false;
         loginButton.value = "LOGIN";
      }
   })
});