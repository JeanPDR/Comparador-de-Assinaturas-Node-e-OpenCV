const express = require('express');
const { spawn } = require('child_process');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());
const upload = require('./public/js/multerConfig');
const { Sequelize, DataTypes } = require('sequelize');

// Cria uma instância do Sequelize para se conectar ao banco de dados
const sequelize = new Sequelize('sing_db', 'sing_db', 'U@aBtpuG0YWN@8', {
  host: 'sing_db.vpshost5699.mysql.dbaas.com.br',
  dialect: 'mysql',
  define: {
    timestamps: false
  }
});

// Define o modelo de usuário
const Usuario = sequelize.define('Usuario', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  RG: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  CPF: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  }
});

// Sincroniza o modelo com o banco de dados
sequelize.sync().then(() => {
  console.log('Tabela de usuários criada com sucesso!');
}).catch(err => {
  console.error('Erro ao criar tabela de usuários:', err);
});


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

// Rota para criar um novo usuário
app.post('/usuarios', async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body); // Cria um novo usuário no banco de dados
    res.json(usuario); // Retorna o usuário em formato JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
});

// Rota para retornar todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll(); // Busca todos os usuários do banco de dados
    res.json(usuarios); // Retorna os usuários em formato JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// Rota para retornar um usuário pelo ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id); // Busca um usuário pelo ID
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json(usuario); // Retorna o usuário em formato JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
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