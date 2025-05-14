import { showAlert } from "./alerts.js";

// Actualizar nombre y email o contraseña
const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' // Si el tipo es password
            ? 'http://localhost:3000/api/v1/users/updateMyPassword' // Actualiza la contraseña
            : 'http://localhost:3000/api/v1/users/updateMe'; // Actualiza el nombre y email

        const res = await axios({
            method: 'PATCH', // Método PATCH para actualizar
            url, // URL de la API
            data // Datos a enviar
        })

        if (res.data.status === 'success') { // Si la respuesta es exitosa
            showAlert('success', 'Datos actualizados correctamente'); // Muestra un mensaje de éxito
            location.reload(); // <-- Esta línea fuerza la recarga de la página

        }
    } catch (err) {
        showAlert('error', err.response.data.message); // Muestra un mensaje de error
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const userDataForm = document.querySelector('.form-user-data'); // Selecciona el formulario de datos del usuario
    const userPasswordForm = document.querySelector('.form-user-password'); // Selecciona el formulario de contraseña
    if (userDataForm) {
        userDataForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData(); // Crea un nuevo objeto FormData
            form.append('name', document.querySelector('#name').value); // Añade el nombre al objeto FormData
            form.append('email', document.querySelector('#email').value); // Añade el email al objeto FormData
            form.append('photo', document.querySelector('input[name="photo"]').files[0]); // Añade la foto al objeto FormData
            console.log('Datos enviados:', form); // Muestra los datos enviados en la consola
            updateSettings(form, 'data'); // Llama a la función para actualizar los datos
        })
    }
    if (userPasswordForm) {
        userPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita el comportamiento por defecto del formulario
            document.querySelector('.btn--save-password').textContent = 'Actualizando...'; // Cambia el texto del botón a "Actualizando..."
            const passwordCurrent = document.querySelector('#password-current').value; // Obtiene la contraseña actual
            const password = document.querySelector('#password').value; // Obtiene la nueva contraseña
            const passwordConfirm = document.querySelector('#password-confirm').value; // Obtiene la confirmación de la nueva contraseña
            
            
            await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password'); // Llama a la función para actualizar la contraseña

            // Elimino los valores de los campos
            document.querySelector('#password-current').value = ''; 
            document.querySelector('#password').value = ''; 
            document.querySelector('#password-confirm').value = ''; 
            document.querySelector('.btn--save-password').textContent = 'Cambiar contraseña'; // Cambia el texto del botón a "Actualizando..."

        })
    }
});
