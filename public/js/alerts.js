export const hideAlert = () => {
    const alert = document.querySelector('.alert');
    if (alert) alert.parentElement.removeChild(alert); // si existe la alerta, la elimino
}

export const showAlert = (type, message) => {
    hideAlert(); // escondo la alerta anterior si existe
    const markup = `<div class="alert alert--${type}">${message}</div>`; // creo el html de la alerta
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup); // inserto el html en el body
    window.setTimeout(hideAlert, 5000); // escondo la alerta después de 5 segundos
}
