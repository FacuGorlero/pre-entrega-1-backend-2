const { Router } = require("express");
const  {UsuarioModel}  = require("../Daos-Mongo/mongo/Models/users.model");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { createHash, isValidPassword } = require("../utils/hashpassword.js");

const router = Router();

router.post("/register", async (req, res) => {
  let { first_name, last_name, email, password } = req.body;

  try {
    // Validar campos vacíos
    if (!first_name || !email || !password) {
      return res.status(400).send('Faltan completar campos obligatorios');
    }

    // Verificar si el email ya existe en la base de datos
    const existeusuario = await UsuarioModel.findOne({ email });

    if (existeusuario) {
      return res.status(400).send("El usuario ya existe");
    }

    // Crear nuevo usuario
    const nuevousuario = new UsuarioModel({
      email,
      first_name,
      last_name,
      password: createHash(password),
    });

    await nuevousuario.save();

    // Crear token JWT
    const token = jwt.sign({ email: nuevousuario.email, role: nuevousuario.role }, "coderhouse", {
      expiresIn: "1h",
    });

    // Establecer cookie
    res.cookie("coderCookieToken", token, {
      maxAge: 3600000,
      httpOnly: true,
    });

    res.redirect("/api/sessions/current");
  } catch (err) {
    console.error("Error en la ruta /register:", err); // Añadir para ver el error en los logs
    res.status(500).send(`Error interno del servidor: ${err.message}`)
  }
});


router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    if (email === '' || password === '') {
      return res.send('todos los campos son obligatoris')
  }

    const usuarioEncontrado = await UsuarioModel.findOne({ email });

    if (!usuarioEncontrado) {
      return res.status(400).send("El usuario no existe");
    }

    if (!isValidPassword(password, usuarioEncontrado)) {
      return res.status(401).send("Contraseña incorrecta");
    }

    //Generar el token JWT
    const token = jwt.sign(
      { email: usuarioEncontrado.email, role: usuarioEncontrado.role },
      "coderhouse",
      { expiresIn: "1h" }
    );

    //Creamos la cookie
    res.cookie("coderCookieToken", token, {
      maxAge: 3600000,
      httpOnly: true,
    });

    res.redirect("/api/sessions/current");
  } catch (error) {
    res.status(500).send("Error interno del servidor");
  }
});

router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  (req, res) => {
    res.render("perfil", { 
      first_name: req.user.first_name, 
      email: req.user.email 
    });
  }
);

router.post("/logout", (req, res) => {
  //Limpiamos la cookie
  res.clearCookie("coderCookieToken");
  res.redirect("/login");
});


router.get(
  "/admin",
  passport.authenticate("current", { session: false }),
  (req, res) => {
    if (req.user.role !== "admin") {
      console.log(req.user); // Añadir esta línea para verificar el objeto req.user

      return res
        .status(403)
        .send("Acceso denegado, vete ladron malvado de mi vida!");
    }
    res.render("admin");
    
  }
);

exports.userRouter = router;
