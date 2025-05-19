import { showAlert } from './alerts.js'; // importo la función showAlert para mostrar mensajes al usuario
const stripe = Stripe('pk_test_51RNxsC2fM8iRKK1aDgvt5evrX4SojOH4HGC05CeSEv3kxc0WR4VVmp3Rt5dYDMKU4XvYIRWyYdRCNqfTpgGK6aq000Z5pfiWYO');

const bookCar = async (carId) => {
    try {
        const session = await axios.get(
            `/api/v1/sales/checkout-session/${carId}`,
            { withCredentials: true } // Asegura que las cookies se envíen
        );
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id // redirijo a la sesion de pago
        });

    } catch (err) {
        console.log(err);
        showAlert('Ha ocurrido un error al procesar tu pago. Por favor, inténtalo de nuevo más tarde.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const bookBtn = document.querySelector('#btn-comprar');
    if (bookBtn) {
        bookBtn.addEventListener('click', e => {
            e.target.textContent = 'Procesando...'; // Cambia el texto del botón a "Procesando..."
            const carId = e.target.dataset.carId; // obtengo el ID del coche desde el atributo data-car-id del botón
            bookCar(carId); // llamo a la función bookCar y le paso el ID del coche a comprar
        });
    }
});
