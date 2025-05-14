import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
    const reserveButton = document.querySelector('.boton--verde');

    if (reserveButton) {
        reserveButton.addEventListener('click', async (e) => {
            const carId = e.target.dataset.id;

            try {
                const res = await axios({
                    method: 'PATCH',
                    url: `/api/v1/cars/${carId}/reserve`
                });

                if (res.data.status === 'success') {
                    showAlert('success', '¡Coche reservado correctamente!');
                    setTimeout(() => {
                        location.reload(); // Recarga la página para reflejar los cambios
                    }, 1000);
                }
            } catch (err) {
                showAlert('error', err.response.data.message || 'Error al reservar el coche');
            }
        });
    }
});
