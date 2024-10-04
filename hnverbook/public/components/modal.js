export class HnverModal {
   modal;
   timer;
   disableOutclick;

   constructor() {
      this.modal = document.createElement('dialog');
      this.modal.classList.add('hnverModal');
      this.disableOutclick = false;
      this.timer = null;

      // Close the modal when clicking outside the content
      this.modal.addEventListener('click', (e) => {
         const rect = this.modal.getBoundingClientRect();
         if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
         ) {
            if (!this.disableOutclick) {
               this.close();
            }
         }
      });

      // Set up default theme
      this.modal.style.setProperty('--themeColor',
         '#000');
      this.modal.style.setProperty('--modalColor',
         '#000');
   }

   showConfirmation( {
      theme = 'var(--tertiaryColorDark)',
      color = 'var(--primaryTextColorBright)',
      title,
      description,
      toast,
      buttons = []
   } = {}) {

      // Clear previous content if any
      this.modal.innerHTML = '';

      // Set theme and color
      this.modal.style.setProperty('--themeColor',
         theme);
      this.modal.style.setProperty('--modalColor',
         color);

      // Accessibility improvements
      this.modal.setAttribute('role',
         'dialog');
      this.modal.setAttribute('aria-labelledby',
         'modalTitle');
      this.modal.setAttribute('aria-describedby',
         'modalDescription');

      // Create a layout
      let layout = new DocumentFragment();

      // Title
      let titleElem = document.createElement('h2');
      titleElem.id = 'modalTitle';
      titleElem.textContent = title;

      if (title && !toast) {
         layout.appendChild(titleElem);
      }

      // Description
      let descriptionElem = document.createElement('p');
      descriptionElem.id = 'modalDescription';
      descriptionElem.textContent = description;

      if (description && !toast) {
         layout.appendChild(descriptionElem);
      }

      let toastElem = document.createElement('p');
      toastElem.id = 'modalDescription';
      toastElem.textContent = toast;
      toastElem.classList.add('toast');

      if (toast) {
         layout.appendChild(toastElem);
      }

      // Buttons Container
      let buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'buttonsContainer';

      // Create buttons
      buttons.forEach((button) => {
         let buttonElem = document.createElement('button');
         buttonElem.textContent = button.text || 'BUTTON';

         // Button click action
         buttonElem.onclick = button.callback || (() => this.close());

         if (button.type) buttonElem.classList.add(button.type.toLowerCase());
         if (button.background) buttonElem.style.background = button.background;
         if (button.color) buttonElem.style.color = button.color;
         if (button.border && button.borderColor) {
            buttonElem.style.border = `${button.border}px solid ${button.borderColor}`;
         }

         buttonsContainer.appendChild(buttonElem);
      });

      if (buttons.length > 0) {
         layout.appendChild(buttonsContainer);
      }
      this.modal.appendChild(layout);

      this.show();
   }

   show() {
      document.body.appendChild(this.modal);

      this.modal.animate([{
         opacity: 0
      }, {
         opacity: 1
      }], {
         duration: 200,
         fill: 'forwards'
      });

      this.modal.showModal();

      if (this.timer) {
         setTimeout((function() {
            this.close();
         }).bind(this), this.timer);
      }

   }

   close() {
      this.modal.animate([{
         opacity: 1
      }, {
         opacity: 0
      }], {
         duration: 200,
         fill: 'forwards'
      }).onfinish = () => {
         this.modal.close();
         try {
            document.body.removeChild(this.modal);
         } catch (e) {
            console.log(e.message)
         }
      };
   }
   settings({
      disableOutclick, timer, position
   }) {
      if (disableOutclick) this.disableOutclick = disableOutclick;
      if (timer && !isNaN(timer)) {
         this.timer = timer;
      }
      if (position) {
         switch (position) {
            case "center":
               this.modal.style.setProperty('transform', 'translate(-50%, -50%)');
               this.modal.style.setProperty('left', '50%');
               this.modal.style.setProperty('top', '50%');
               break;
            case "top-right":
               this.modal.style.setProperty('transform', 'translate(-75%, -5%)');
               this.modal.style.setProperty('top', '5%');
               this.modal.style.setProperty('left', '75%');
               break;
            case "top-center":
               this.modal.style.setProperty('transform', 'translate(-50%, -5%)');
               this.modal.style.setProperty('top', '5%');
               this.modal.style.setProperty('left', '50%');
               break;
            case "top-left":
               this.modal.style.setProperty('transform', 'translate(-25%, -5%)');
               this.modal.style.setProperty('top', '5%');
               this.modal.style.setProperty('left', '25%');
               break;
            case "bottom-center":
               this.modal.style.setProperty('transform', 'translate(-50%, -95%)');
               this.modal.style.setProperty('top', '95%');
               this.modal.style.setProperty('left', '50%');
               break;
            default:
               this.modal.style.setProperty('transform', 'translate(-50%, -50%)');
               this.modal.style.setProperty('left', '50%');
               this.modal.style.setProperty('top', '50%');
            }
         }
      }
   }