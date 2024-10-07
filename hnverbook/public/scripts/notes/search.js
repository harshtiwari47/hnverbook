'use strict'

const InputLayout = document.getElementById('inputSearch');

async function search() {
   let theme = document.getElementById('app').getAttribute('data-theme');
   
   theme = theme === 'light' ? '171b20' : 'dbe1e8'; 
   
   const InputLayout = document.getElementById('inputSearch');
   let q = InputLayout.value.toLowerCase().trim();
   const container = document.getElementById('results');

   const parsedUrl = new URL(window.location.href);
   let queries = parsedUrl.pathname.split('/');
   const spaceId = queries[queries.length - 1];

   if (q.length > 0) {
      const response = await fetch(`/notes/search/${spaceId}?q=${q}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
      });

      let notes = await response.json();

      container.innerHTML = ``;

      let doc = new DocumentFragment();

      notes.forEach((note, index) => {
         let mainCard = document.createElement('div');
         mainCard.classList.add('item');
         mainCard.classList.add('note');
         mainCard.id = `noteCard${index}`;
         mainCard.innerHTML = `
         <img src="/icon/stroke/Note With Text/${theme}/36/1.5" width="25" height="25" class="noteIcon" alt="Note Icon">
         <div class="noteInfo">
         <p class="title">${note.title}</p>
         <div class="bottomDetails">
         <p class="updated">${note.updatedAt}</p>
         </div>
         </div>
         `;
         mainCard.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `/notes/view/${note.spaceId}/${note.noteId}`;
         });
         doc.appendChild(mainCard);
      })

      container.appendChild(doc);
   } else {
      container.innerHTML = `            <div class="resultMessage">
      Looking for notes? Start typing and find the note you're after in no time!
      </div>`;
   }
}

InputLayout.addEventListener("input", search);