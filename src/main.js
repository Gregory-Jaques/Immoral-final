import './style.css'

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Logic ---
    const mobileMenuOpenBtn = document.getElementById('mobileMenuOpenBtn');
    const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileSubmenuButtons = document.querySelectorAll('[data-target]');

    if (mobileMenuOpenBtn && mobileMenuOverlay) {
        mobileMenuOpenBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }

    if (mobileMenuCloseBtn && mobileMenuOverlay) {
        mobileMenuCloseBtn.addEventListener('click', () => {
            mobileMenuOverlay.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuOverlay && !mobileMenuOverlay.classList.contains('hidden')) {
            mobileMenuOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Mobile Submenus
    mobileSubmenuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetSubmenu = document.getElementById(targetId);
            const arrow = btn.querySelector('.arrow-icon');

            if (targetSubmenu) {
                const isExpanded = btn.getAttribute('aria-expanded') === 'true';

                // Toggle current
                if (isExpanded) {
                    targetSubmenu.classList.add('hidden');
                    btn.setAttribute('aria-expanded', 'false');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                } else {
                    targetSubmenu.classList.remove('hidden');
                    btn.setAttribute('aria-expanded', 'true');
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                }
            }
        });
    });


    // --- Desktop Menu Scroll Effect ---

    const nav = document.querySelector('nav.hidden.xl\\:flex');
    const logoImg = nav?.querySelector('div:first-child img');
    const navLinksContainer = nav?.querySelector('.list-none');
    const navArrows = navLinksContainer?.querySelectorAll('img[alt="arrowDown"]');

    if (nav && logoImg && navLinksContainer) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                // Scrolled state
                nav.classList.add('bg-white', 'shadow-md', 'py-2');
                nav.classList.remove('pt-5', 'bg-transparent');

                logoImg.src = '/imgs/Menues/logo-menu-oscuro.png';
                navLinksContainer.classList.remove('text-white');
                navLinksContainer.classList.add('text-black');

                // Invert arrows to black (assuming they are white by default)
                if (navArrows) {
                    navArrows.forEach(arrow => arrow.classList.add('invert'));
                }
            } else {
                // Top state
                nav.classList.remove('bg-white', 'shadow-md', 'py-2');
                nav.classList.add('pt-5', 'bg-transparent');

                logoImg.src = '/imgs/Menues/logo-menu-claro.png';
                navLinksContainer.classList.add('text-white');
                navLinksContainer.classList.remove('text-black');

                // Revert arrows to white
                if (navArrows) {
                    navArrows.forEach(arrow => arrow.classList.remove('invert'));
                }
            }
        });
    }

    // --- Desktop Dropdowns ---
    // Logic to show/hide dropdowns on hover/click is partially handled by CSS hover in original, 
    // but let's ensure it works smoothly or add JS if needed. 
    // The extracted HTML has IDs like 'dropdownButton', 'dropdown'.
    // Let's add simple hover logic if CSS isn't enough or for better control.

    const setupDropdown = (btnId, dropdownId) => {
        const btn = document.getElementById(btnId);
        const dropdown = document.getElementById(dropdownId);
        if (!btn || !dropdown) return;

        let timeout;

        const show = () => {
            clearTimeout(timeout);
            dropdown.classList.remove('hidden');
        };

        const hide = () => {
            timeout = setTimeout(() => {
                dropdown.classList.add('hidden');
            }, 200);
        };

        btn.addEventListener('mouseenter', show);
        btn.addEventListener('mouseleave', hide);
        dropdown.addEventListener('mouseenter', show);
        dropdown.addEventListener('mouseleave', hide);
    };

    setupDropdown('dropdownButton', 'dropdown');
    setupDropdown('dropdownButton2', 'dropdown2');
    setupDropdown('dropdownButton3', 'dropdown3');


    // --- How We Do Section (Process) ---
    const processItems = document.querySelectorAll('.proceso-item');
    const processImage = document.querySelector('img[alt="imagen de como hacemos 1"]');

    if (processItems.length > 0 && processImage) {
        processItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                // Reset all
                processItems.forEach(i => {
                    const sub = i.querySelector('.proceso-subtitulo');
                    if (sub) sub.classList.add('hidden');
                });

                // Activate current
                const sub = item.querySelector('.proceso-subtitulo');
                if (sub) sub.classList.remove('hidden');

                // Change Image
                const processId = item.getAttribute('data-proceso');
                // Map IDs to images. Assuming images are named consistently
                // Original code had specific mapping or naming convention.
                // Let's assume /imgs/img-como-hacemos-X.png
                // Note: Original file names might be different. Let's check if we can infer.
                // Based on `how_we_do.js`: `src="./imgs/img-como-hacemos-${numero}.png"`
                processImage.src = `/imgs/img-como-hacemos-${processId}.png`;
            });
        });
    }


    // --- Testimonials Carousel ---
    const track = document.querySelector('.testimonials-track');
    const prevBtn = document.getElementById('simple-testimonials-prev');
    const nextBtn = document.getElementById('simple-testimonials-next');

    if (track && prevBtn && nextBtn) {
        const cards = document.querySelectorAll('.testimonial-card');
        if (cards.length > 0) {
            let currentIndex = 0;
            const cardWidth = cards[0].offsetWidth + 24; // Width + margin-right (mr-6 is 1.5rem = 24px)
            // Note: mr-6 is 24px.

            const updateCarousel = () => {
                const translateX = -(currentIndex * cardWidth);
                track.style.transform = `translateX(${translateX}px)`;
            };

            nextBtn.addEventListener('click', () => {
                if (currentIndex < cards.length - 1) {
                    currentIndex++;
                    updateCarousel();
                } else {
                    // Optional: Loop back to start
                    currentIndex = 0;
                    updateCarousel();
                }
            });

            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                } else {
                    // Optional: Loop to end
                    currentIndex = cards.length - 1;
                    updateCarousel();
                }
            });

            // Handle resize to update card width if needed (though fixed width in CSS helps)
            window.addEventListener('resize', () => {
                // Recalculate card width in case of responsive changes
                // In the HTML, width is w-full xl:w-[520px].
                // If mobile, it's w-full.
                const newCardWidth = cards[0].offsetWidth + 24;
                const translateX = -(currentIndex * newCardWidth);
                track.style.transform = `translateX(${translateX}px)`;
            });
        }
    }

    // Carrusel infinito para los logos de marcas
    function initCarousel() {
        const carousel = document.querySelector('.carousel-container');
        const logosContainer = document.querySelector('.logos-container');

        if (!carousel || !logosContainer) return;

        // Duplicar los logos para crear el efecto infinito
        const originalLogos = logosContainer.innerHTML;
        logosContainer.innerHTML = originalLogos + originalLogos;

        // Variables para controlar la animación
        let currentPosition = 0;
        const speed = 0.5; // Velocidad del movimiento (píxeles por frame)
        let isPaused = false;

        // Función para animar el carrusel
        function animateCarousel() {
            if (!isPaused) {
                currentPosition -= speed;

                // Resetear posición cuando llegue a la mitad (logos duplicados)
                const containerWidth = logosContainer.scrollWidth / 2;
                if (Math.abs(currentPosition) >= containerWidth) {
                    currentPosition = 0;
                }

                logosContainer.style.transform = `translateX(${currentPosition}px)`;
            }

            animationId = requestAnimationFrame(animateCarousel);
        }

        // Función para pausar el carrusel
        function pauseCarousel() {
            isPaused = true;
        }

        // Función para reanudar el carrusel
        function resumeCarousel() {
            isPaused = false;
        }

        // Event listeners para hover
        carousel.addEventListener('mouseenter', pauseCarousel);
        carousel.addEventListener('mouseleave', resumeCarousel);

        // Event listeners individuales para cada logo
        const logos = logosContainer.querySelectorAll('img');
        logos.forEach(logo => {
            logo.addEventListener('mouseenter', pauseCarousel);
            logo.addEventListener('mouseleave', resumeCarousel);
        });

        // Iniciar la animación
        animateCarousel();
    }

    // Team Carousel - Two rows with opposite directions (continuous infinite scroll)
    function initTeamCarousel() {
        // Right-moving carousel (first row)
        const carouselRight = document.querySelector('.team-carousel-container-right');
        const trackRight = document.querySelector('.team-carousel-track-right');

        // Left-moving carousel (second row)
        const carouselLeft = document.querySelector('.team-carousel-container-left');
        const trackLeft = document.querySelector('.team-carousel-track-left');

        if (!carouselRight || !trackRight || !carouselLeft || !trackLeft) return;

        // Variables para controlar la animación del carrusel derecho
        let currentPositionRight = 0;
        const speedRight = 0.8; // Velocidad del movimiento (píxeles por frame)
        let animationIdRight;

        // Variables para controlar la animación del carrusel izquierdo
        let currentPositionLeft = 0;
        const speedLeft = 0.8; // Velocidad del movimiento (píxeles por frame)
        let animationIdLeft;

        // Función para animar el carrusel derecho (hacia la derecha) - infinito continuo
        function animateTeamCarouselRight() {
            currentPositionRight -= speedRight;

            // Crear efecto infinito suave sin resetear bruscamente
            const trackWidth = trackRight.scrollWidth / 2;
            if (Math.abs(currentPositionRight) >= trackWidth) {
                currentPositionRight += trackWidth;
            }

            trackRight.style.transform = `translateX(${currentPositionRight}px)`;
            animationIdRight = requestAnimationFrame(animateTeamCarouselRight);
        }

        // Función para animar el carrusel izquierdo (hacia la izquierda) - infinito continuo
        function animateTeamCarouselLeft() {
            currentPositionLeft += speedLeft;

            // Crear efecto infinito suave sin resetear bruscamente
            const trackWidth = trackLeft.scrollWidth / 2;
            if (currentPositionLeft >= 0) {
                currentPositionLeft = -trackWidth;
            }

            trackLeft.style.transform = `translateX(${currentPositionLeft}px)`;
            animationIdLeft = requestAnimationFrame(animateTeamCarouselLeft);
        }

        // Inicializar posición del carrusel izquierdo para que empiece desde la izquierda completa
        currentPositionLeft = -(trackLeft.scrollWidth / 2);

        // Iniciar las animaciones continuas
        animateTeamCarouselRight();
        animateTeamCarouselLeft();
    }


    // Initialize carousel if it exists
    initCarousel();

    // Initialize team carousel
    initTeamCarousel();

});


