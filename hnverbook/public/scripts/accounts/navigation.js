'use strict'
try {
   let tabs = document.getElementById('tabLists');
   Array.from(tabs.children).forEach((value, index) => {
      tabs.children[index].classList.remove('active');
      tabs.children[index].addEventListener('click', (e) => {
         e.preventDefault();
         Array.from(tabs.children).forEach((el) => el.classList.remove('active'));
         tabs.children[index].classList.add('active');
      });
   });
tabs.children[0].classList.add('active');
} catch (e) {
   console.log(e.message);
}