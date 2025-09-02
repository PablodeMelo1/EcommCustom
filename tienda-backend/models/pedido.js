import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
  numeroPedido: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    color: String,  
    talle: String   
  }],
  tipoEntrega: { 
    type: String, 
    enum: ['envio', 'retiro'], 
    required: true 
  },
  direccion: String,
  numeroCasa: String,
  tipoCasa: String,
  ciudad: String,
  departamento: String,
  pais: { type: String, default: 'Uruguay' },
  infoAdicional: String,
  total: Number,
  paymentMethod: { type: String, enum: ['mercado_pago', 'transferencia', 'efectivo'], required: true },
  estado: { type: String, default: 'pendiente' },
  fecha: { type: Date, default: Date.now }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
export default Pedido;
