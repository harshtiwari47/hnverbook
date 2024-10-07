class Notes {
   constructor() {}

   createSpace(value, i, theme) {
      let card = document.createElement('div');
      card.id = `space${i}`;
      card.setAttribute('data-id', value.spaceId);
      card.style.setProperty('--spaceColor', value.color);
      card.className = 'spaces';
      card.innerHTML = `
      <div data-color="${value.color}" class="info">
      <a href="/notes/spaces/edit/${value.spaceId}" title="edit space"><img src="/icon/stroke/Edit Pen/${theme === 'light' ? '171b20': 'dbe1e8' }/30/1.5" width="25" height="25" alt="edit" title="Edit"></a>
      <p class="notes-count">NOTES: ${value.notesCount}</p>
      </div>
      <h2 class="space-title">${value.title}</h2>
      <p class="space-description">${value.description}</p>
      `;

      card.addEventListener("click", (e) => {
         e.preventDefault();
         window.location.href = `/notes/spaces/view/${value.spaceId}`
      });
      return card;
   }
}