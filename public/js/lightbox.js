document.addEventListener('DOMContentLoaded', () => {
    const galeria = document.querySelector('.galeria');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    let images = [];
    let currentIndex = 0;

    if (galeria && lightbox && lightboxImg) {
        images = Array.from(galeria.querySelectorAll('.galeria__foto'));

        galeria.addEventListener('click', (e) => {
            if (e.target.classList.contains('galeria__foto')) {
                currentIndex = images.indexOf(e.target);
                showImage(currentIndex);
                lightbox.style.display = 'flex';
            }
        });

        btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                lightboxImg.src = '';
            }
        });
    }

    function showImage(idx) {
        if (images[idx]) {
            lightboxImg.src = images[idx].src;
        }
    }
});