const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});

router.post('/', 
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').trim().isEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  async (req, res) => {
    // Verifica si hay errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Encripta la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    await newUser.save();
    res.redirect('/users');
  }
);

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
