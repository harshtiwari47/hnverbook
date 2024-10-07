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

async function deleteNotePermanent() {
   const createButton = document.getElementById('createNoteBtn');
   const parsedUrl = new URL(window.location.href);
   let queries = parsedUrl.pathname.split('/');

   const spaceId = queries[queries.length - 2];
   const noteId = queries.pop();

   const response = await fetch(`/notes/delete/${spaceId}/${noteId}`, {
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
         toast: "Deleting Note Failed"
      });
   }
}

window.deleteNote = function () {
   let deleteModal = new HnverModal();
   deleteModal.settings({
      disableOutclick: false,
      position: "center"
   })
   deleteModal.showConfirmation({
      title: "Delete Note",
      theme: "var(--secondaryColor)",
      color: "var(--primaryTextColorBright)",
      description: "Are you sure, you want to delete this note?",
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
               deleteNotePermanent();
               deleteModal.close();
            }
         },
      ]
   });
}

document.getElementById('error-message').style.display = "none";
document.addEventListener("DOMContentLoaded", () => {

   if (document.getElementById('updateNote') !== null) {
      document.getElementById('updateNote').addEventListener('submit', async (e) => {
         e.preventDefault();
         const createButton = document.getElementById('createNoteBtn');
         createButton.disabled = true;
         createButton.value = "Please Wait";

         const formData = {
            bgColor: event.target.bgColor.value.trim(),
            textColor: event.target.textColor.value.trim(),
            title: event.target.title.value.trim(),
            note: event.target.note.value.trim(),
         };

         const parsedUrl = new URL(window.location.href);
         let queries = parsedUrl.pathname.split('/');

         const spaceId = queries[queries.length - 2];
         const noteId = queries.pop();

         const response = await fetch(`/notes/update/${spaceId}/${noteId}`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
         });

         const result = await response.json();
         if (result.statusCode >= 200 && result.statusCode < 299) {
            window.location.href = `/notes/spaces/view/${spaceId}`;
         } else {
            document.getElementById('error-message').style.display = "block";
            document.getElementById('error-message').textContent = result.message;
            createButton.disabled = false;
            createButton.value = "UPDATE —>";
         }
      })
   }

   if (document.getElementById('createNote') !== null) {
      document.getElementById('createNote').addEventListener('submit',
         async (e) => {
            e.preventDefault();
            const createButton = document.getElementById('createNoteBtn');
            createButton.disabled = true;
            createButton.value = "Please Wait";

            const formData = {
               bgColor: event.target.bgColor.value.trim(),
               textColor: event.target.textColor.value.trim(),
               title: event.target.title.value.trim(),
               note: event.target.note.value.trim(),
            };

            const parsedUrl = new URL(window.location.href);
            let queries = await parsedUrl.pathname.split('/');
            const spaceId = queries.pop();
            console.log(spaceId)
            
            const response = await fetch(`/notes/create/${spaceId}/new`, {
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
const textareaNote = document.getElementById('note');
textareaNote.addEventListener('scroll', autoResize);
autoResize.call(textareaNote);

const textareaTitle = document.getElementById('title');
textareaTitle.addEventListener('scroll', autoResize);
autoResize.call(textareaTitle);