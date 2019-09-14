import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  // define como será guardado o arquivo cdn, pasta
  // diskStorage -> é uma forma de enviar o arquivo para dentro da aplicação ou em qualquer outro lugar
  storage: multer.diskStorage({
    // definição do caminho no qual a imagem será enviada
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    // nome do arquivo
    // filename ela aceita uma função
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        // o primeiro parametro que o callback ( cb ) recebe é de erro
        // caso não de erro, será retornado null
        // res.toString('hex')-> transforma os 16bytes em valor hexadecimal
        // extname irá pegar somente a extensão do arquivo

        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
