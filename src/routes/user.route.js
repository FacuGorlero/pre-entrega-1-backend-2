const { Router } = require("express");
const  {UsuarioModel}  = require("../Daos-Mongo/mongo/Models/users.model");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { createHash, isValidPassword } = require("../utils/hashpassword.js");

const router = Router();

router.post("/register", async (req, res) => {
  let { usuario, password } = req.body;

  try {
    const existeusuario = await UsuarioModel.findOne({ usuario });

    if (existeusuario) {
      return res.status(400).send("El usuario ya existe");
    }

    const nuevousuario = new UsuarioModel({
      usuario,
      password: createHash(password),
    });

    await nuevousuario.save();

    const token = jwt.sign({ usuario: nuevousuario.usuario }, "coderhouse", {
      expiresIn: "1h",
    });

    res.cookie("coderCookieToken", token, {
      maxAge: 3600000,
      httpOnly: true,
    });

    res.redirect("/api/sessions/current");
  } catch (err) {
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/login", async (req, res) => {
  let { usuario, password } = req.body;

  try {
    const usuarioEncontrado = await UsuarioModel.findOne({ usuario });

    if (!usuarioEncontrado) {
      return res.status(400).send("El usuario no existe");
    }

    if (!isValidPassword(password, usuarioEncontrado)) {
      return res.status(401).send("Contraseña incorrecta");
    }

    //Generar el token JWT
    const token = jwt.sign(
      { usuario: usuarioEncontrado.usuario, rol: usuarioEncontrado.rol },
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
    res.render("perfil", { usuario: req.user.usuario });
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
    if (req.user.rol !== "admin") {
      return res
        .status(403)
        .send("Acceso denegado, vete ladron malvado de mi vida!");
    }
    res.render("admin");
  }
);

exports.userRouter = router;
