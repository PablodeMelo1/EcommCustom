# EcommCustom
Ecommerce Customizable Documentacion 

**Objetivo general**
Desarrollar una plataforma que permita a pequeñas y medianas empresas tener su propia tienda online de forma rápida, económica y totalmente personalizable, sin necesidad de conocimientos técnicos.
La idea es que el cliente (dueño de la tienda) acceda a un panel donde pueda modificar:

Logo, colores y estilos generales.
Menús y secciones (home, productos, galerías, testimonios).
Agregar / editar productos.
Visualizar su sitio en tiempo real.


Además, el sistema se encarga de:
Generar el sitio con el dominio del cliente.
Gestionar toda la infraestructura técnica (backend, base de datos, hosting).


**Objetivo Alternativo: **
Desarrollar y ofrecer varios productos y servicios similares para poder ofrecerle variedad al cliente. Ejemplos:
OnePage informativa personalizada creada por nosotros (Desarrolladores).
Ecommerce personalizado por nosotros (Desarrolladores), lo cual implicaria que el cliente no dedique tiempo a customizar el producto elevando el costo del mismo.



El proyecto está dividido en dos grandes aplicaciones (todo esto puede cambiar, es provisorio hecho por ia):
Frontend público (React)

Es el sitio web de la tienda que ven los compradores.

Se adapta dinámicamente a la configuración que cargó el administrador (colores, logo, secciones, etc).

Backend API (Node.js + Express)

Expone los datos de configuración, productos y manejo de usuarios.

Se comunica con el frontend mediante HTTP (REST API).

Requerimientos funcionales (RF)
RF01: Permitir al administrador iniciar sesión en el panel.
RF02: Permitir configurar logo, colores y menú.
RF03: Permitir cargar productos con nombre, descripción, imagen y precio.
RF04: Mostrar la tienda pública adaptada a la configuración del cliente.
RF05: Gestionar pedidos.

Requerimientos no funcionales (RNF)
RNF01: La aplicación debe estar optimizada para móviles.
RNF02: La API debe responder en menos de 300ms local.
RNF03: Seguridad mínima mediante validación de datos.
RNF04: Código prolijo, comentado y documentado para facilitar mantenimiento.



Conclusión
Este proyecto ofrece una solución integral para negocios pequeños y medianos que necesitan vender online con su propia identidad visual, de forma rápida y segura. El enfoque “self-service” le permite al cliente tener el control total de su tienda, mientras nosotros gestionamos toda la infraestructura.
