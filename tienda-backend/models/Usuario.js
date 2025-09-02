import mongoose from 'mongoose';

const UsuarioSchema = new mongoose.Schema({
  mail: String,
  contra: String,
  role: {
    type: String,
    enum: ['admin', 'cliente'],
    default: 'cliente'
  },
  nombre: String,
  numTelefono: Number,
});

export default mongoose.model('Usuario', UsuarioSchema);
