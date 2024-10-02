const bcrypt = require('bcrypt')

exports.createHash = psw => bcrypt.hashSync(psw, bcrypt.genSaltSync(10))

exports.isValidPassword = (psw,user) => bcrypt.compareSync(psw, user.password)