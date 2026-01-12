# LKS Cars App

Este es un proyecto de desarrollo completo que abarca desde la creación de una API RESTful hasta el despliegue en producción, incluyendo un flujo de pago real y facturación automatizada.

## Funcionalidades

- **Autenticación y Autorización:** Implementado con JWT (JSON Web Tokens) para rutas protegidas.
- **Pagos con Stripe:** Integración completa para procesar pagos seguros.
- **Facturación Electrónica:** Envío automático de facturas al correo del cliente tras la compra.
- **Base de Datos:** Gestión de productos y usuarios con MongoDB.
- **API Documentada:** Estructura clara de endpoints para integración con frontend.

## Tecnologías

- **Backend:** Node.js, Express.js
- **Base de datos:** MongoDB (Mongoose)
- **Seguridad:** JWT, Bcrypt
- **Pasarela de Pago:** Stripe SDK
- **Email:** Nodemailer / SendGrid
- **Control de Versiones:** Git & GitHub

## Estructura de la API

### Usuarios y Autenticación (`/api/v1/users`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| POST | `/signup` | Registro de nuevos usuarios | Público |
| POST | `/login` | Inicio de sesión | Público |
| PATCH | `/updateMyPassword` | Cambiar contraseña actual | Usuario autenticado |
| GET | `/me` | Obtener mi perfil | Usuario autenticado |
| PATCH | `/addFavorite/:carId` | Guardar en favoritos | Usuario autenticado |
| GET | `/` | Obtener todos los usuarios | Admin |
| DELETE | `/:id` | Eliminar usuario | Admin |

### Gestión de Vehículos (`/api/v1/cars`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| GET | `/` | Listar todos los coches | Público |
| GET | `/:id` | Ver detalles de un coche | Público |
| POST | `/` | Crear nuevo coche (con imágenes) | Admin |
| PATCH | `/:id` | Editar coche e imágenes | Admin |
| DELETE | `/:id` | Eliminar vehículo | Admin |

### Ventas y Facturación (`/api/v1/sales`)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| GET | `/checkout-session/:carId` | Crea sesión de pago Stripe | Usuario autenticado |
| GET | `/:saleId/factura` | Descargar factura en PDF | Usuario autenticado |

## Estructura de Vistas (Frontend)
La aplicación renderiza las siguientes vistas principales:
* ` / `: Catálogo general de vehículos.
* `/car/:id`: Vista detallada del coche seleccionado.
* `/me`: Panel de configuración del perfil de usuario.
* `/my-purchases`: Historial de compras del cliente.
* `/favorites`: Lista de deseos personalizada.
* `/manage-cars`: Panel de control de inventario (**Admin**).
* `/admin-stats`: Visualización de métricas de negocio (**Admin**).

## Demo del Proceso de Compra
![Demo del Proceso de Compra](./public/img/procesoCompra.gif)


## Despliegue en producción
Desplegado en Railway
