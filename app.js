const express = require('express');
const { spawn } = require('child_process');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const app = express();

const upload = require('./public/js/multerConfig');


app.post('/uploads', upload.fields([{ name: 'imagem1', maxCount: 1 }, { name: 'imagem2', maxCount: 1 }]), (req, res) => {
  const img1TempPath = req.files['imagem1'][0].path;
  const img2TempPath = req.files['imagem2'][0].path;

  const img1NewPath = './uploads/img1.jpg'; // novo nome da imagem 1
  const img2NewPath = './uploads/img2.jpg'; // novo nome da imagem 2

  fs.renameSync(img1TempPath, img1NewPath);
  fs.renameSync(img2TempPath, img2NewPath);

  console.log('Imagens renomeadas com sucesso');
  res.redirect('/resultado');
});



// Define a função deleteFiles
const deleteFiles = () => {
  const dirPath = './uploads';
  const filesToDelete = ['img1.jpg', 'img2.jpg'];

  filesToDelete.forEach((file) => {
    const filePath = `${dirPath}/${file}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`${filePath} foi excluído com sucesso.`);
      }
    });
  });
};
// Rotas para utilizar arquivos estaticos
app.use(express.static('public'));
app.use(express.static('public/css'));
app.use(express.static('public/js'));
// Rota para excluir os arquivos com nomes específicos
app.post('/delete-files', (req, res) => {
  deleteFiles();
  res.redirect('/');
});
// Rota que permite a visualização de paginas (Views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('comparador-final');
});

app.get('/photo-editor', (req, res) => {
  res.render('photo-editor');
});

// rota que execulta codigo em Python com Node
app.get('/resultado', (req, res) => {
  const pyProg = spawn('python', ['opencv.py']);

  let resultado = '';

  pyProg.stdout.on('data', function(data) {
    resultado += data.toString();
  });

  pyProg.stderr.on('data', (data) => {
    res.status(500).send(`Erro: ${data}`);
  });

  pyProg.on('close', () => {
    res.render('index', { resultado });
  });
});

app.listen(3000, () => {
  console.log('Aplicação web iniciada na porta 3000!');
});