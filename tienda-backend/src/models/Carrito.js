// models/carrito.js
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
  color: String,   // 👈 nuevo
  talle: String    // 👈 nuevo
});

const carritoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  items: [itemSchema],
}, {
  timestamps: true
});

const Carrito = mongoose.model('Carrito', carritoSchema);
export default Carrito;
