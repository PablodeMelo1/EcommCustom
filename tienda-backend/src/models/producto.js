import mongoose from 'mongoose';
import { comentarioSchema } from './comentario.js';



const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true  },
  img: String,
  imgPublicId: String,
  descripcion: String,
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },

  oferta: { type: Boolean, default: false },
  descuento: { type: Number, default: 0 }, // en porcentaje
  comentarios: [comentarioSchema],

  destacado: { type: Boolean, default: false },
  coloresCheck: { type: Boolean, default: false },
  colores: [String],

  tallesCheck: { type: Boolean, default: false },
  talles: [String]
});

// 👇 Opción: precio final calculado automáticamente (si querés usar esto en tu app)
productoSchema.virtual('precioFinal').get(function () {
  if (this.oferta && this.descuento > 0) {
    const precioNumerico = parseFloat(this.precio);
    return (precioNumerico - (precioNumerico * this.descuento / 100)).toFixed(2);
  }
  return this.precio;
});

productoSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Producto', productoSchema);
