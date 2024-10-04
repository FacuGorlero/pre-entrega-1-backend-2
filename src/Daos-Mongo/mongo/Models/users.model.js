const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');  // Corregido el nombre

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
      type: String,
      required: true    
    },
    atCreated: {
      type: Date,
      default: Date.now
    },
    birthday: {
      type: Date
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: 'carts'
    }
  });


userSchema.pre('find', function () {
  this.populate('cart');
});

userSchema.plugin(mongoosePaginate);  // Corregido el nombre

const UsuarioModel = model('usuarios', userSchema);

module.exports = {
  UsuarioModel
};
