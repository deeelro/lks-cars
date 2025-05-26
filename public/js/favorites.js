import { showAlert } from './alerts.js';

document.addEventListener('DOMContentLoaded', () => {
    const deleteButtons = document.querySelectorAll('.btn-fav-remove');

    deleteButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
            const carId = e.target.dataset.id;

            try {
                const res = await axios({
                    method: 'PATCH',
                    url: `/api/v1/users/removeFavorite/${carId}`
                });

                if (res.data.status === 'success') {
                    showAlert('success', 'Coche eliminado de favoritos');
                    e.target.closest('.tarjeta').remove(); // Elimina la tarjeta del DOM
                }
            } catch (err) {
                showAlert('error', 'Error al eliminar el coche de favoritos');
            }
        });
    });
});


/* Añadir a favoritos */
document.addEventListener('DOMContentLoaded', () => {
    const favoriteButton = document.querySelector('.boton--amarillo');

    if (favoriteButton) {
        favoriteButton.addEventListener('click', async (e) => {
            const carId = e.target.dataset.id;

            try {
                const res = await axios({
                    method: 'PATCH',
                    url: `/api/v1/users/addFavorite/${carId}`
                });

                if (res.data.status === 'success') {
                    showAlert('success', 'Coche añadido a favoritos');
                }
            } catch (err) {
                showAlert('error', 'Error al añadir el coche a favoritos');
            }
        });
    }
});