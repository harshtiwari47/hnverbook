'use strict'
import {
   HnverModal
} from '/components/modal.js'

let toastModal = new HnverModal();
toastModal.settings({
   disableOutclick: true,
   timer: 2000,
   position: "top-right"
});

window.copyCurrentUrl = (self = false, username = null) => {
  let currentUrl;
   if (!self) {
    currentUrl = window.location.href;
   } else {
    currentUrl = `${window.location.origin}/profile/${username}`;
   }

    const textarea = document.createElement("textarea");
    textarea.value = currentUrl;
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Optionally, alert the user
    toastModal.showConfirmation({
            theme: "var(--warningColor)",
            color: "var(--primaryTextColorBright)",
            toast: "URL COPIED!"
     })
}

let observerBtn = document.getElementById('observeBtn');
let observingCount = document.getElementById('observingCount');
let observerCount = document.getElementById('observerCount');
if (observerBtn) {
   observerBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const parsedUrl = new URL(window.location.href);
      const username = parsedUrl.pathname.split('/').pop();

      const response = await fetch(`/observeState/${username}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         
         if (result.status === "observe") {
         observerBtn.classList.add('observing');
         observerBtn.classList.remove('observe');
         observerBtn.textContent = `OBSERVING`;
         observerCount.textContent = Number(observerCount.textContent) + 1;
         } else {
         observerCount.textContent = Number(observerCount.textContent) - 1;
         observerBtn.classList.remove('observing');
         observerBtn.classList.add('observe');
         observerBtn.textContent = `OBSERVE`;
         }
      } else {
         toastModal.showConfirmation({
            theme: "var(--warningColor)",
            color: "var(--primaryTextColorBright)",
            toast: "Action failed"
         })
      }
   })
}