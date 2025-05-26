import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
    // Funcionalidad para añadir vehículos nuevos
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

    // Funcionalidad para administrar vehículos 
    const deleteButtons = document.querySelectorAll('.btn-car-delete');
    deleteButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
            const carId = e.target.dataset.id;

            try {
                const res = await axios({
                    method: 'DELETE',
                    url: `/api/v1/cars/${carId}`
                });

                if (res.status === 204) {
                    showAlert('success', 'Vehículo eliminado correctamente');
                    e.target.closest('tr').remove(); // Elimina la fila de la tabla
                }
            } catch (err) {
                showAlert('error', 'Error al eliminar el vehículo');
            }
        });
    });
});
