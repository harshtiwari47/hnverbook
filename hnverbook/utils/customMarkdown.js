export function parseCustomMarkdown(input) {
   // Escape any < or > tags to prevent XSS attacks and display them properly
   let sanitizedInput = input
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;");

   // Handle bold: **bold text**
   sanitizedInput = sanitizedInput.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

   // Handle underline: __underline text__
   sanitizedInput = sanitizedInput.replace(/__(.*?)__/g, "<u>$1</u>");


   // Handle italic: _italic text_
   sanitizedInput = sanitizedInput.replace(/_(.*?)_/g, "<i>$1</i>");

   // Handle headers:
   // H1: # Header 1
   sanitizedInput = sanitizedInput.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
   // H2: ## Header 2
   sanitizedInput = sanitizedInput.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
   // H3: ### Header 3
   sanitizedInput = sanitizedInput.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

   // Handle ordered lists (ol): 1. First item
   sanitizedInput = sanitizedInput.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");
   sanitizedInput = sanitizedInput.replace(/(<li>.*<\/li>)(?!<\/ol>)/g, "<ol>$1</ol>");

   // Handle unordered lists (ul): - First item
   sanitizedInput = sanitizedInput.replace(/^- (.*?)$/gm, "<li>$1</li>");
   sanitizedInput = sanitizedInput.replace(/(<li>.*<\/li>)(?!<\/ul>)/g, "<ul>$1</ul>");

   sanitizedInput = sanitizedInput.replace(/\[color="(.*?)"\](.*?)\[\/color\]/g, '<span style="color:$1">$2</span>');

   // Handle links: [link text](url)
   sanitizedInput = sanitizedInput.replace(/\[([^]+)(https?:\/\/[^\s]+)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

   // Regex to match the format ![Image Alt](url)
   const imageRegex = /!\[([^\]]+)]\(([^)]+)\)/;

   // Replace the match with the image tag
   sanitizedInput = sanitizedInput.replace(imageRegex, (match, altText, url) => {
      // Validate URL: starts with http or https, no quotes
      if (url.startsWith("http") && !url.includes("'") && !url.includes('"')) {
         return `<img src="${url}" alt="${altText}" />`;
      } else {
         // Invalid URL: return the original match
         return match;
      }
   });


   sanitizedInput = sanitizedInput.replace(/\[([^\]]+)]\(([^)]+)\)/,
      (match, linkText, url) => {
         if (!url.startsWith("javascript:")) {
            return `<a href="${url}" target="_blank">${linkText}</a>`;
         }
         return match; // If URL starts with "javascript:", return the original match
      });


   // Wrap unsafe tags in <pre>
   sanitizedInput = sanitizedInput.replace(/&lt;(.*?)&gt;/g,
      "<pre>&lt;$1&gt;</pre>");

   return sanitizedInput;
}