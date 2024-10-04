import {
   autoResize
} from '/scripts/utils/common.js'

const textareaTitle = document.getElementById('title');
textareaTitle.addEventListener('scroll', autoResize);
autoResize.call(textareaTitle);

const textareaKeywords = document.getElementById('keywords');
textareaKeywords.addEventListener('scroll', autoResize);
autoResize.call(textareaKeywords);