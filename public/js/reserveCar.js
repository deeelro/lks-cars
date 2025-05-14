import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
    const reserveButton = document.querySelector('.boton--verde, .boton--rojo');

    if (reserveButton) {
        reserveButton.addEventListener('click', async (e) => {
            const carId = e.target.dataset.id;
            const isReserved = e.target.classList.contains('boton--rojo'); // Verifica si el coche ya está reservado

            try {
                const res = await axios({
                    method: 'PATCH',
                    url: `/api/v1/cars/${carId}/${isReserved ? 'unreserve' : 'reserve'}` // Cambia entre reservar y desreservar
                });

                if (res.data.status === 'success') {
                    showAlert('success', isReserved ? '¡Coche desreservado correctamente!' : '¡Coche reservado correctamente!');

                    // Cambia el botón dinámicamente
                    if (isReserved) {
                        e.target.textContent = 'Reservar';
                        e.target.classList.remove('boton--rojo');
                        e.target.classList.add('boton--verde');
                    } else {
                        e.target.textContent = 'Desreservar';
                        e.target.classList.remove('boton--verde');
                        e.target.classList.add('boton--rojo');
                    }
                }
            } catch (err) {
                showAlert('error', err.response.data.message || 'Error al procesar la solicitud');
            }
        });
    }
});
