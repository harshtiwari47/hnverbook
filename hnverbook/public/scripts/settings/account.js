'use strict'

import {
   HnverModal
} from '/components/modal.js'
import {
   autoResize
} from '/scripts/utils/common.js'

let toastModal = new HnverModal();
toastModal.settings({
   disableOutclick: true,
   timer: 2000,
   position: "top-right"
});

document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
   document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const updateButton = document.getElementById('updateProfile');
      updateButton.disabled = true;
      updateButton.value = "Please Wait";

      const formData = {
         name: event.target.name.value.trim(),
         username: event.target.username.value.trim(),
         description: event.target.description.value.trim(),
         link: event.target.link.value.trim()
      };
      const response = await fetch('/auth/update/profile', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = "Profile Updated.";
         updateButton.disabled = false;
         updateButton.value = "UPDATE";

         toastModal.showConfirmation({
            theme: "var(--successColor)",
            color: "var(--primaryTextColorBright)",
            toast: "Profile Updated"
         })
      } else {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = result.message;
         updateButton.disabled = false;
         updateButton.value = "UPDATE";
         
         toastModal.showConfirmation({
            theme: "var(--warningColor)",
            color: "var(--primaryTextColorBright)",
            toast: "Profile Updated"
         })
      }
   })
});

const textareaDes = document.getElementById('description');
textareaDes.addEventListener('scroll', autoResize);
autoResize.call(textareaDes);