'use strict'
document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
   document.getElementById('blipPostForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const postButton = document.getElementById('postButton');
      postButton.disabled = true;
      postButton.value = "Please Wait";

      const title = window.location.pathname.split('/').pop();
      const formData = {
         title,
         description: event.target.description.value,
         keywords: event.target.keywords.value,
      };
      const response = await fetch('/submit/blip', {
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
         document.getElementById('error-message').style.display = "flex";
         document.getElementById('error-message').children[1].textContent = result.message;
         postButton.disabled = false;
         postButton.value = "POST —›";
      }
   })
})