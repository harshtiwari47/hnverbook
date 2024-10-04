'use strict'

import {
   HnverModal
} from '/components/modal.js'
import {
   autoResize
} from '/scripts/utils/common.js';

let toastModal = new HnverModal();
toastModal.settings({
   disableOutclick: true,
   timer: 2000,
   position: "top-right"
});

async function deleteSpacePermanent() {
   const spaceId = window.location.pathname.split('/').pop();

      const response = await fetch(`/notes/space/delete/${spaceId}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include'
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         window.location.href = "/notes";
      } else {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = result.message;
         createButton.disabled = false;
         createButton.value = "UPDATE —>";
         
         toastModal.showConfirmation({
            theme: "var(--warningColor)",
            color: "var(--primaryTextColorBright)",
            toast: "Deleting Space Failed"
         })
      }
}

window.deleteSpace = function () {

   let deleteModal = new HnverModal();
   deleteModal.settings({
      disableOutclick: false,
      position: "center"
   })
   deleteModal.showConfirmation({
      title: "Delete Space",
      theme: "var(--secondaryColor)",
      color: "var(--primaryTextColorBright)",
      description: "Are you sure, you want to delete this space? You will also lose your all notes within this space.",
      buttons: [{
         text: "CANCEL",
         type: "cancel",
         color: "#600404",
         border: 0,
         borderColor: "#600404",
         callback: () => {
            deleteModal.close();
         }
      },
         {
            text: "DELETE",
            type: "confirm",
            background: "red",
            color: "#fff",
            callback: () => {
               deleteSpacePermanent();
               deleteModal.close();
            }
         },
      ]
   });
}

document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {
   
   if (document.getElementById('updateSpace') !== null) {
   document.getElementById('updateSpace').addEventListener('submit', async (e) => {
      e.preventDefault();
      const createButton = document.getElementById('createSpaceBtn');
      createButton.disabled = true;
      createButton.value = "Please Wait";

      const formData = {
         color: event.target.color.value.trim(),
         title: event.target.title.value.trim(),
         description: event.target.description.value.trim(),
      };
      const spaceId = window.location.pathname.split('/').pop();

      const response = await fetch(`/notes/space/update/${spaceId}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
         body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.statusCode >= 200 && result.statusCode < 299) {
         window.location.href = "/notes";
      } else {
         document.getElementById('error-message').style.display = "block";
         document.getElementById('error-message').textContent = result.message;
         createButton.disabled = false;
         createButton.value = "UPDATE —>";
      }
   })
   }
   
   if (document.getElementById('createSpace') !== null) {
   document.getElementById('createSpace').addEventListener('submit',
      async (e) => {
         e.preventDefault();
         const createButton = document.getElementById('createSpaceBtn');
         createButton.disabled = true;
         createButton.value = "Please Wait";

         const formData = {
            color: event.target.color.value.trim(),
            title: event.target.title.value.trim(),
            description: event.target.description.value.trim(),
         };
         const response = await fetch('/notes/space/create/new', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
         });

         const result = await response.json();
         if (result.statusCode >= 200 && result.statusCode < 299) {
            window.location.href = "/notes";
         } else {
            document.getElementById('error-message').style.display = "block";
            document.getElementById('error-message').textContent = result.message;
            createButton.disabled = false;
            createButton.value = "CREATE —>";
         }
      })
   }
})

// auto resize textareas 
const textareaDes = document.getElementById('description');
textareaDes.addEventListener('scroll', autoResize);
autoResize.call(textareaDes);

const textareaTitle = document.getElementById('title');
textareaTitle.addEventListener('scroll', autoResize);
autoResize.call(textareaTitle);