import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  logoUrl: String,
  colorNav: String,
  colorPrincipal: String,
  fuentePrincipal: String,
  nombreTienda: String,
  bannerTexto: String,
  tipoCatalogo: { type: String, default: "grid" },

  mercadoPagoCheck: { type: Boolean, default: false },
  transferenciaCheck: { type: Boolean, default: false },
  efectivoCheck: { type: Boolean, default: false },

  accessTokenMP: String,
  efectivoTexto: String,

  transferenciaCuentas: [
    {
      nombre: String,
      banco: String,
      numeroCuenta: String
    }
  ],

  retiroLocalCheck: { type: Boolean, default: false },
  retiroLocalTexto: String,

  igCheck: { type: Boolean, default: false },
  xCheck: { type: Boolean, default: false },
  fbCheck: { type: Boolean, default: false },
  ttCheck: { type: Boolean, default: false },
  wpCheck: { type: Boolean, default: false },
  emailCheck: { type: Boolean, default: false },

  igTexto: String,
  xTexto: String,
  fbTexto: String,
  ttTexto: String,
  wpTexto: Number,
  emailTexto: String,

});

export default mongoose.model('Config', configSchema);
