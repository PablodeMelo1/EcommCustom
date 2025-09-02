import mongoose from 'mongoose';

// ✅ Solo exportá el schema, no el modelo
export const comentarioSchema = new mongoose.Schema({
  nombre: String,
  mensaje: String,
  puntuacion: Number,
  fecha: { type: Date, default: Date.now }
});
