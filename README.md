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

| Método | Endpoint | Descripción | Auth |
| :--- | :--- | :--- | :---: |
| POST | `/api/auth/register` | Registro de nuevos usuarios | ❌ |
| POST | `/api/auth/login` | Inicio de sesión (Retorna Token) | ❌ |
| GET | `/api/products` | Obtener catálogo de productos | ❌ |
| POST | `/api/checkout` | Enviar carrito y procesar pago | ✅ |
| GET | `/api/orders/me` | Historial de compras del usuario | ✅ |

## Demo del Proceso de Compra

![Demo del proceso de compra](./assets/compra-demo.gif)

## Despliegue en producción
Desplegado en Railway
