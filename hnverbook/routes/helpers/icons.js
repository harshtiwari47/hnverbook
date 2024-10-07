import express from 'express';
var iconRouter = express.Router();

import fs from 'fs';
import path from 'path';
import {
   fileURLToPath
} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

iconRouter.get('/stroke/:name/:color?/:size?/:strokeWidth?', function(req, res, next) {
   const {
      name, size = 48, strokeWidth = '1.3'
   } = req.params;
   let {
      color = "~black"
   } = req.params;

   if (color.includes('~')) {
      color = color.replace('~', '');
   } else {
      color = "#" + color;
   }

   const filePath = path.join(__dirname, '../../public/icon/svg/stroke', `${name}.svg`);
   fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
         return res.status(404).send('Icon not found');
      }

      let updatedSvg = data.replaceAll(/fill="[^"]*"/g, `fill="${color}"`);
      updatedSvg = data.replaceAll(/stroke="[^"]*"/g, `stroke="${color}"`);
      updatedSvg = updatedSvg.replace(/width="\d*"/, `width="${size}"`);
      updatedSvg = updatedSvg.replace(/height="\d*"/, `height="${size}"`);
      updatedSvg = updatedSvg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(updatedSvg);
   });
});

export default iconRouter;