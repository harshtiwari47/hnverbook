import { HnverModal } from '../components/modal.js'

if (document.querySelector('.app #screen')) {
   document.querySelector('.app').classList.add('layout-horizontal');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/scripts/service-worker.js?v=1.2').then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }, function(err) {
      console.log('Service Worker registration failed:', err);
    });
  });
}