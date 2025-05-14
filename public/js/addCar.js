import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
    const addCarForm = document.querySelector('.form-add-car');
    if (addCarForm) {
        addCarForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const form = new FormData(addCarForm); // Crea un objeto FormData con los datos del formulario

            try {
                const res = await axios({
                    method: 'POST',
                    url: '/api/v1/cars', // Ruta para crear un coche
                    data: form,
                });

                if (res.data.status === 'success') {
                    showAlert('success', '¡Vehículo añadido correctamente!');
                    setTimeout(() => {
                        location.assign('/add-car'); // Redirige a la misma página
                    }, 1000);
                }
            } catch (err) {
                showAlert('error', err.response.data.message || 'Error al añadir el vehículo');
            }
        });
    }
});
