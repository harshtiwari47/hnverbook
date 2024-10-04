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