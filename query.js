use tienda

db.configs.insertOne({
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  colorPrincipal: "#61dafb",
  nombreTienda: "Mi Tienda Demo",
  tipoCatalogo: "grid"
})

db.productos.insertMany([
  { nombre: "Remera React", precio: "$25", img: "https://via.placeholder.com/150", descripcion: "Remera negra con logo de React." },
  { nombre: "Gorra Node", precio: "$15", img: "https://via.placeholder.com/150", descripcion: "Gorra verde con logo de Node." },
  { nombre: "Taza JavaScript", precio: "$10", img: "https://via.placeholder.com/150", descripcion: "Taza blanca con logo JS." },
  { nombre: "Sticker FullStack", precio: "$5", img: "https://via.placeholder.com/150", descripcion: "Pack de stickers para laptops." }
])

db.productos.insertOne({
    nombre: "Camperon PHP", 
    precio: "$35", 
    img: "https://via.placeholder.com/150", 
    descripcion: "Camperon con el logo azul de PHP." 
})

db.configs.updateOne(
  { _id: ObjectId("6866d67efec71987d77f5ea8") },
  {
    $set: {
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      colorNav: "#ff5722",
      colorPrincipal: "#ff5722",
      nombreTienda: "Mi Nueva Tienda",
      tipoCatalogo: "list"
    }
  }
)


db.usuarios.insertOne({
      mail: "admin@gmail.com",
      nombre: "Administrador",
      role: "admin",
      contra: "admin1234",
      nroTelefono:"099487566"
    })

db.usuarios.insertOne({
      mail: "cliente@gmail.com",
      nombre: "Cliente",
      role: "cliente",
      contra: "cliente1234",
      nroTelefono:"099457123"
    })
    
db.configs.find()
db.usuarios.find()
db.productos.find()