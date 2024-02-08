/* importações */
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// Configuração resposta JSON
app.use(express.json())

// Models
const User = require('./src/models/User')

// Rota Publica
app.get('/', (req,res) => {
    res.status(200).json({msg: 'Bem vindo a nossa API' })
})

// Rota privada
app.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id;

    // check if user exists
  const user = await User.findById(id, "-senha");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
    const authHeader = req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) return res.status(401).json({ msg: "Acesso negado!" });
  
    try {
      const secret = process.env.SECRET;
  
      jwt.verify(token, secret);
  
      next();
    } catch (err) {
      res.status(400).json({ msg: "O Token é inválido!" });
    }
  }

// Registo de Usuarios
app.post('/auth/register', async(req, res) => {

    const { nome, email, senha, confirmasenha } = req.body

    // Validações
    if (!nome){
        return res.status(422).json({ msg: 'O Nome é obrigatorio!' })
    }
    if (!email){
        return res.status(422).json({ msg: 'O E-mail é obrigatorio!' })
    }
    if (!senha){
        return res.status(422).json({ msg: 'O Senha é obrigatorio!' })
    }
    if (!confirmasenha){
        return res.status(422).json({ msg: 'A Confirmação de Senha é obrigatoria!' })
    }
    if (senha !== confirmasenha) {
        return res.status(422).json({ msg: 'As senhas não conferem!' })
    }

    // Verificação de e-mail já cadastrado
    const usuarioExistente = await User.findOne({ email: email })

    if (usuarioExistente) {
        return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
      }

    // Criação de Senha
    const salt  = await bcrypt.genSalt(12)
    const hashSenha = await bcrypt.hash(senha, salt)

    // Criação de Usuario

    const user = new User({
        nome,
        email,
        senha: hashSenha,
    })

    try {

        await user.save()

        if (usuarioExistente){
            return res.status(422).json({ msg: 'Por favor, utilize outro e-mail'})
        }
    

        res.status(201).json({ msg: 'Usuario criado com sucesso!'})


    } catch(error) {
        console.log(error)

        res
            .status(500)
            .json({
                msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!',
            })

    }
    
})

// Login do Usuario
app.post('/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    //validação
    if (!email){
        return res.status(422).json({ msg: 'O E-mail é obrigatorio!' })
    }
    if (!senha){
        return res.status(422).json({ msg: 'O Senha é obrigatorio!' })
    }

    // Verificação de e-mail existente
    const user = await User.findOne({ email: email })

    if (!user){
        return res.status(404).json({ msg: 'Usuario não encontrado!' })
    }

    // Verificação de Senha atual
    const verificaSenha = await bcrypt.compare(req.body.senha, user.senha)
        if (!verificaSenha) {
            return res.status(422).json({ msg: "Senha inválida" });
          }

    try {

        const secret = process.env.SECRET

        const token = jwt.sign(
            {
                id: user._id,
            }, 
            secret
        );
            res.status(200).json({ msg: 'Autenticação realizada com sucesso', token })
    } catch {
        console.log(error)

        res
            .status(500)
            .json({
                msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!',
            })

    }
    
})

//Credenciais

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.nwg4g52.mongodb.net/`
    )
.then(() => {
    app.listen(3001)
    console.log('Conectou ao banco!')
})
.catch((err) => console.log(err))

