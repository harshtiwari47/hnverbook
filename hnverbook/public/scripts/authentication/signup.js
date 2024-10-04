'use strict'
document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
   document.getElementById('signupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const signupButton = document.getElementById('signup-button');
      signupButton.disabled = true;
      signupButton.value = "Please Wait";

      const formData = {
         email: event.target.email.value.trim(),
         password: event.target.password.value.trim(),
         username: event.target.username.value.trim(),
      };
      const response = await fetch('/auth/signup', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         window.location.href = "/auth/login";
      } else {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = result.message;
         signupButton.disabled = false;
         signupButton.value = "SIGNUP";
      }
   })
})