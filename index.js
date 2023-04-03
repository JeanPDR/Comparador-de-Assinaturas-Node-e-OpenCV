const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

// Sincroniza o modelo com o banco de dados
sequelize.sync().then(() => {
  console.log('Tabela criada com sucesso!');
  
  // Cria um novo usuário
  Usuario.create({
    nome: 'Nome do Usuário',
    login: 'login_do_usuario',
    RG: '000000000',
    CPF: '00000000000'
  }).then(usuario => {
    console.log(usuario.toJSON());
  });
}).catch(err => console.log(err));