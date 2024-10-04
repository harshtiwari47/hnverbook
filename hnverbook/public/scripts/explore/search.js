'use strict'

const InputLayout = document.getElementById('inputSearch');

async function search() {
   const theme = document.getElementById('app').getAttribute('data-theme');
   const InputLayout = document.getElementById('inputSearch');
   let q = InputLayout.value.toLowerCase().trim();
   const container = document.getElementById('results');

   if (q.length > 0) {
      const response = await fetch(`/explore/search/user?q=${q}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include',
      });

      let user = await response.json();
     
      container.innerHTML = ``;

      let doc = new DocumentFragment();

      user.forEach((user, index) => {
         let mainCard = document.createElement('div');
         mainCard.classList.add('item');
         mainCard.classList.add('user');
         mainCard.id = 'userCard';
         mainCard.innerHTML = `
         <img src="/images/user.jpg" width="25" height="25" class="userProfile" alt="User profile">
         <div class="userInfo">
         <p class="name">${user.name}</p>
         <div class="bottomDetails">
         <p class="username">@${user.username}</p>
         ${user.verified ? `<img src="/icon/stroke/Verified Check/${theme === 'light' ? 'fe1d59' : 'ff5e89'}/30/2.5" width="15" height="15" alt="verified">`: ''}
         </div>
         </div>
         `;
         mainCard.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `/profile/${user.username}`;
         });
         doc.appendChild(mainCard);
      })
      
      container.appendChild(doc);
   } else {
      container.innerHTML = `            <div class="resultMessage">
               Looking for someone? Start typing and find the user you're after in no time!
            </div>`;
   }
}

InputLayout.addEventListener("input", search);