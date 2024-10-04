import crypto from 'crypto';

export function encrypt(text) {
   const algorithm = 'aes-256-cbc';
   const key = Buffer.from(process.env.POST_SECRET, 'hex');
   const iv = crypto.randomBytes(16);

   const cipher = crypto.createCipheriv(algorithm, key, iv);
   let encrypted = cipher.update(text, 'utf8', 'hex');
   encrypted += cipher.final('hex');

   return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
   };
}

export function decrypt(encryptedTitle) {
   const algorithm = 'aes-256-cbc';
   const key = process.env.POST_SECRET;
   const [iv,
      encryptedData] = encryptedTitle.split(':');
   const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

   let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
   decrypted += decipher.final('utf8');

   return decrypted;
}