
const { Schema, model } = require('mongoose')
const mongososePaginate = require('mongoose-paginate-v2');


const userSchema = new Schema({
    
    usuario: String,
password: {
        type: String,
        required:true    
    },
    atCreated: {
        type: Date,
        default: Date()
    },
    
    birthday: {
        type: Date
      },
    role: {
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'carts'
      }
})

userSchema.pre('find', function () {
    this.populate('cart');
  });
  
  userSchema.plugin(mongososePaginate)

const UsuarioModel = model('usuarios', userSchema)

module.exports = {
    UsuarioModel
}