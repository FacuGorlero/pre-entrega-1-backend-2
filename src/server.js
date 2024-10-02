const express = require("express");
const handlebars = require("express-handlebars");
const {viewsrouter} = require("./routes/views.route.js");
const { Server } = require("socket.io");
const {connectDb} = require('./config/index.js');
const appRouter   = require('./routes');
const { ProductMongo } = require('./Daos-Mongo/mongo/products.daomongo.js');
const cookieParser = require ("cookie-parser");
const passport = require('passport');
const {userRouter} = require('./routes/user.route.js');
const {initializePassport} = require('./config/passport.config.js');
const session = require ("express-session")
const MongoStore = require ("connect-mongo");

const app = express();
const port = 8080;

connectDb()


// configuraciones de la App
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(passport.initialize()); 
initializePassport(); 
app.use(
  session({
      secret: "coderhouse",
      resave: true,
      saveUninitialized: true,
      store: MongoStore.create({
          mongoUrl:
              'mongodb+srv://facundogorlero:Lucas-10@zogk.a4uasms.mongodb.net/SportClub?retryWrites=true&w=majority',
          ttl: 100,
      }),
  })
);

// motor de plantilla
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Permitir acceso a propiedades heredadas
    allowProtoMethodsByDefault: true     // (Opcional) Permitir acceso a métodos heredados
  }
}));
app.set('view engine', 'hbs');
app.set("views", __dirname + "/views");

// definiendo vistas
app.use('/', viewsrouter)
app.use("/api/sessions", userRouter); 
app.use(appRouter)


app.use(( err, req, res, next)=>{
  console.error(err.stack)
  res.status(500).send('Error de server')
})

const serverHttp = app.listen(port, () => {
  console.log(`Server andando en port ${port}`);
});


// Servidor WebSocket
const ServerIO = new Server(serverHttp);
const productos = new ProductMongo();

ServerIO.on('connection', async (io) => {
  console.log('Nuevo cliente conectado');

  // Emitir productos al conectar un nuevo cliente
  const listproduct = await productos.getProducts();
  console.log('Productos enviados:', listproduct); // Verificar productos
  io.emit('productos', listproduct || []);

  io.on('nuevoproducto', async (newProduct) => {
      await productos.addProduct(newProduct);
      const updatedProducts = await productos.getProducts();
      io.emit('productos', updatedProducts || []);
  });

  io.on('eliminarProducto', async (code) => {
      await productos.deleteProductByCode(code);
      const updatedProducts = await productos.getProducts();
      io.emit('productos', updatedProducts || []);
  });
});







  