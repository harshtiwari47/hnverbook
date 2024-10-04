'use strict'

async function likePost(postId, theme) {
   try {
      let content = document.getElementById(`like${postId}`);
      let count = content.children[1];
      let icon = content.children[0];

      const response = await fetch(`/post/${postId}/like`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         credentials: 'include'
      });

      const result = await response.json();
      if (result.status === 'liked') {
         count.textContent = parseInt(count.textContent) + 1;
         icon.src = `/icon/stroke/Thumbs Up/${theme === 'light' ? 'ea1919': 'c26666'}/40/3`;
      } else if (result.status === 'unliked') {
         icon.src = `/icon/stroke/Thumbs Up/${theme === 'light' ? '171b20': 'dbe1e8'}/40/1.5`;
         count.textContent = parseInt(count.textContent) - 1;
      } else {
         alert('Something went wrong while performing like operation.');
      }
   } catch (e) {
      console.log(e.message)
   }
}