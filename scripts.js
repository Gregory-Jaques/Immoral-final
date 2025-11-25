// Variables globales para el carrusel
let animationId;

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

// Portfolio Carousel with free drag functionality
function initPortfolioCarousel() {
    const container = document.querySelector('.portfolio-carousel-container');
    const track = document.querySelector('.portfolio-carousel-track');
    const prevBtn = document.querySelector('.portfolio-nav-prev');
    const nextBtn = document.querySelector('.portfolio-nav-next');
    const cards = document.querySelectorAll('.portfolio-card');
    
    if (!container || !track || cards.length === 0) return;
    
    // Free drag variables
    let currentTranslateX = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let initialTransform = 0;
    let maxTranslateX = 0;
    let minTranslateX = 0;
    let isInitialized = false;
    let hasDragged = false;
    let dragThreshold = 5; // Minimum pixels to consider it a drag
    
    // Wait for images to load before initializing
    function waitForImages() {
        const images = track.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve); // Continue even if image fails
            });
        });
        
        return Promise.all(imagePromises);
    }
    
    // Calculate dimensions and limits with validation and retry
    function updateDimensions(retryCount = 0) {
        const containerWidth = container.offsetWidth;
        const trackWidth = track.scrollWidth;
        
        // Validate dimensions - retry if trackWidth is 0 or invalid
        if (trackWidth === 0 || containerWidth === 0) {
            if (retryCount < 3) {
                console.warn(`Portfolio carousel: Invalid dimensions detected (container: ${containerWidth}px, track: ${trackWidth}px). Retrying... (${retryCount + 1}/3)`);
                setTimeout(() => updateDimensions(retryCount + 1), 100 * (retryCount + 1));
                return;
            } else {
                console.error('Portfolio carousel: Failed to get valid dimensions after 3 retries');
                return;
            }
        }
        
        // Calculate limits for free scrolling
        maxTranslateX = 0; // Can't scroll right beyond start
        
        // Only set minTranslateX if track is wider than container
        if (trackWidth > containerWidth) {
            minTranslateX = containerWidth - trackWidth; // Can scroll left to show all content
        } else {
            minTranslateX = 0; // If track fits in container, don't allow scrolling
        }
        
        // Ensure current position is within bounds
        currentTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, currentTranslateX));
        updateCarousel();
        
        if (!isInitialized) {
            isInitialized = true;
            console.log(`Portfolio carousel initialized: container ${containerWidth}px, track ${trackWidth}px`);
        }
    }
    
    // Update carousel position
    function updateCarousel() {
        track.style.transform = `translateX(${currentTranslateX}px)`;
        
        // Update button states if they exist
        if (prevBtn && nextBtn) {
            prevBtn.style.opacity = currentTranslateX >= maxTranslateX ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentTranslateX >= maxTranslateX ? 'none' : 'auto';
            nextBtn.style.opacity = currentTranslateX <= minTranslateX ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentTranslateX <= minTranslateX ? 'none' : 'auto';
        }
    }
    
    // Navigation functions (if buttons exist)
    function goToPrev() {
        const scrollAmount = container.offsetWidth * 0.8; // Scroll 80% of container width
        currentTranslateX = Math.min(maxTranslateX, currentTranslateX + scrollAmount);
        track.style.transition = 'transform 0.3s ease-out';
        updateCarousel();
        setTimeout(() => {
            track.style.transition = 'none';
        }, 300);
    }
    
    function goToNext() {
        const scrollAmount = container.offsetWidth * 0.8; // Scroll 80% of container width
        currentTranslateX = Math.max(minTranslateX, currentTranslateX - scrollAmount);
        track.style.transition = 'transform 0.3s ease-out';
        updateCarousel();
        setTimeout(() => {
            track.style.transition = 'none';
        }, 300);
    }
    
    // Mouse drag functionality
    function handleMouseDown(e) {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        currentX = e.clientX;
        initialTransform = currentTranslateX;
        track.style.cursor = 'grabbing';
        track.style.transition = 'none';
        
        // Prevent text selection
        e.preventDefault();
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        currentX = e.clientX;
        const deltaX = currentX - startX;
        
        // Check if drag threshold has been exceeded
        if (Math.abs(deltaX) > dragThreshold) {
            hasDragged = true;
        }
        
        let newTransform = initialTransform + deltaX;
        
        // Apply elastic resistance at boundaries
        if (newTransform > maxTranslateX) {
            const excess = newTransform - maxTranslateX;
            newTransform = maxTranslateX + excess * 0.3; // Elastic effect
        } else if (newTransform < minTranslateX) {
            const excess = minTranslateX - newTransform;
            newTransform = minTranslateX - excess * 0.3; // Elastic effect
        }
        
        track.style.transform = `translateX(${newTransform}px)`;
    }
    
    function handleMouseUp() {
        if (!isDragging) return;
        
        isDragging = false;
        track.style.cursor = 'grab';
        
        const deltaX = currentX - startX;
        let finalTransform = initialTransform + deltaX;
        
        // Snap back to bounds if outside with smooth transition
        finalTransform = Math.max(minTranslateX, Math.min(maxTranslateX, finalTransform));
        
        // Only add transition if we need to snap back to bounds
        if (finalTransform !== initialTransform + deltaX) {
            track.style.transition = 'transform 0.3s ease-out';
            setTimeout(() => {
                track.style.transition = 'none';
            }, 300);
        } else {
            track.style.transition = 'none';
        }
        
        currentTranslateX = finalTransform;
        track.style.transform = `translateX(${currentTranslateX}px)`;
        
        // Update button states
        if (prevBtn && nextBtn) {
            prevBtn.style.opacity = currentTranslateX >= maxTranslateX ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentTranslateX >= maxTranslateX ? 'none' : 'auto';
            nextBtn.style.opacity = currentTranslateX <= minTranslateX ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentTranslateX <= minTranslateX ? 'none' : 'auto';
        }
    }
    
    // Touch functionality
    function handleTouchStart(e) {
        isDragging = true;
        hasDragged = false;
        startX = e.touches[0].clientX;
        currentX = e.touches[0].clientX;
        initialTransform = currentTranslateX;
        track.style.transition = 'none';
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        // Check if drag threshold has been exceeded
        if (Math.abs(deltaX) > dragThreshold) {
            hasDragged = true;
        }
        
        let newTransform = initialTransform + deltaX;
        
        // Apply elastic resistance at boundaries
        if (newTransform > maxTranslateX) {
            const excess = newTransform - maxTranslateX;
            newTransform = maxTranslateX + excess * 0.3; // Elastic effect
        } else if (newTransform < minTranslateX) {
            const excess = minTranslateX - newTransform;
            newTransform = minTranslateX - excess * 0.3; // Elastic effect
        }
        
        track.style.transform = `translateX(${newTransform}px)`;
        
        // Prevent page scroll when dragging horizontally
        if (Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }
    
    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        
        const deltaX = currentX - startX;
        let finalTransform = initialTransform + deltaX;
        
        // Snap back to bounds if outside with smooth transition
        finalTransform = Math.max(minTranslateX, Math.min(maxTranslateX, finalTransform));
        
        // Only add transition if we need to snap back to bounds
        if (finalTransform !== initialTransform + deltaX) {
            track.style.transition = 'transform 0.3s ease-out';
            setTimeout(() => {
                track.style.transition = 'none';
            }, 300);
        } else {
            track.style.transition = 'none';
        }
        
        currentTranslateX = finalTransform;
        track.style.transform = `translateX(${currentTranslateX}px)`;
        
        // Update button states
        if (prevBtn && nextBtn) {
            prevBtn.style.opacity = currentTranslateX >= maxTranslateX ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentTranslateX >= maxTranslateX ? 'none' : 'auto';
            nextBtn.style.opacity = currentTranslateX <= minTranslateX ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentTranslateX <= minTranslateX ? 'none' : 'auto';
        }
    }
    
    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrev);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNext);
    }
    
    // Mouse events
    track.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Solo habilitar eventos táctiles en desktop (pantallas >= 1280px)
    function checkScreenSize() {
        return window.innerWidth >= 1280;
    }
    
    // Función para agregar/remover eventos táctiles según el tamaño de pantalla
    function updateTouchEvents() {
        if (checkScreenSize()) {
            // Desktop: habilitar eventos táctiles
            track.addEventListener('touchstart', handleTouchStart, { passive: false });
            track.addEventListener('touchmove', handleTouchMove, { passive: false });
            track.addEventListener('touchend', handleTouchEnd);
        } else {
            // Mobile: deshabilitar eventos táctiles
            track.removeEventListener('touchstart', handleTouchStart);
            track.removeEventListener('touchmove', handleTouchMove);
            track.removeEventListener('touchend', handleTouchEnd);
        }
    }
    
    // Inicializar eventos táctiles según el tamaño de pantalla
    updateTouchEvents();
    
    // Actualizar eventos táctiles cuando cambie el tamaño de pantalla
    window.addEventListener('resize', () => {
        updateTouchEvents();
        updateDimensions();
    });
    
    // Safari-specific fixes
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        // Force hardware acceleration for Safari
        track.style.webkitTransform = 'translateZ(0)';
        track.style.webkitBackfaceVisibility = 'hidden';
        
        // Safari-specific initialization with proper dimension calculation
        const safariInitialize = () => {
            // Force recalculation of dimensions in Safari
            const containerWidth = container.offsetWidth;
            const trackWidth = track.scrollWidth;
            
            console.log(`Safari init: container ${containerWidth}px, track ${trackWidth}px`);
            
            // Reset position to ensure clean start
            currentTranslateX = 0;
            maxTranslateX = 0;
            
            if (trackWidth > containerWidth) {
                minTranslateX = containerWidth - trackWidth;
            } else {
                minTranslateX = 0;
            }
            
            // Set initial transform explicitly
            track.style.transform = 'translateX(0px)';
            track.style.webkitTransform = 'translateX(0px) translateZ(0)';
            
            // Force reflow
            track.offsetHeight;
            
            console.log(`Safari limits: min ${minTranslateX}px, max ${maxTranslateX}px`);
        };
        
        // Run Safari initialization after a delay
        setTimeout(safariInitialize, 150);
        
        // Prevent Safari from interfering with drag
        track.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });
        
        track.addEventListener('gesturechange', function(e) {
            e.preventDefault();
        });
        
        track.addEventListener('gestureend', function(e) {
            e.preventDefault();
        });
        
        // Safari-specific touch handling with dimension validation
        let safariFirstTouch = true;
        const originalHandleTouchStart = handleTouchStart;
        handleTouchStart = function(e) {
            if (safariFirstTouch) {
                // Validate dimensions before first touch
                const containerWidth = container.offsetWidth;
                const trackWidth = track.scrollWidth;
                
                if (trackWidth > 0 && containerWidth > 0) {
                    // Recalculate limits if needed
                    maxTranslateX = 0;
                    minTranslateX = trackWidth > containerWidth ? containerWidth - trackWidth : 0;
                    
                    // Ensure we start at position 0
                    currentTranslateX = 0;
                    track.style.transform = 'translateX(0px)';
                    track.style.webkitTransform = 'translateX(0px) translateZ(0)';
                    
                    console.log(`Safari first touch: limits min ${minTranslateX}px, max ${maxTranslateX}px`);
                }
                
                safariFirstTouch = false;
            }
            
            originalHandleTouchStart.call(this, e);
        };
    }
    
    // Keyboard navigation
    container.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNext();
        }
    });
    
    // Make container focusable for keyboard navigation
    container.setAttribute('tabindex', '0');
    
    // Window resize handler ya está incluido en updateTouchEvents
    
    // Initial setup with improved initialization
    track.style.cursor = 'grab';
    
    // Initialize with delay and image loading wait
    async function initialize() {
        try {
            // Wait for images to load
            await waitForImages();
            
            // Add a small delay to ensure DOM is fully settled
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Now calculate dimensions
            updateDimensions();
            
            console.log('Portfolio carousel initialized with', cards.length, 'cards');
        } catch (error) {
            console.error('Error initializing portfolio carousel:', error);
            // Fallback initialization without image waiting
            setTimeout(() => {
                updateDimensions();
                console.log('Portfolio carousel initialized (fallback) with', cards.length, 'cards');
            }, 200);
        }
    }
    
    // Prevent link clicks after dragging
    function preventLinkClick(e) {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
    
    // Add click prevention to all links in portfolio cards
    const portfolioLinks = track.querySelectorAll('a');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', preventLinkClick, true);
    });
    
    // Reset hasDragged flag after a short delay when mouse/touch ends
    function resetDragFlag() {
        setTimeout(() => {
            hasDragged = false;
        }, 100); // Small delay to ensure click event is processed
    }
    
    // Add reset to existing mouse and touch end handlers
    const originalHandleMouseUp = handleMouseUp;
    handleMouseUp = function() {
        originalHandleMouseUp();
        resetDragFlag();
    };
    
    const originalHandleTouchEnd = handleTouchEnd;
    handleTouchEnd = function() {
        originalHandleTouchEnd();
        resetDragFlag();
    };
    
    // Start initialization
    initialize();
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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize carousel if it exists
    initCarousel();
    
    // Initialize team carousel
    initTeamCarousel();
    
    // Initialize portfolio carousel
    initPortfolioCarousel();

// Testimonials Carousel - Horizontal Drag
function initTestimonialsCarousel() {
    const container = document.getElementById('testimonials-carousel');
    const track = document.querySelector('.testimonials-track');
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('testimonials-prev');
    const nextBtn = document.getElementById('testimonials-next');
    
    if (!container || !track || slides.length === 0) return;
    
    // Variables para el arrastre
    let currentTranslateX = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let initialTransform = 0;
    let slideWidth = 0;
    let maxTranslateX = 0;
    let minTranslateX = 0;
    let hasDragged = false;
    const dragThreshold = 5;
    let autoplayInterval;
    let currentSlideIndex = 0;
    
    // Calcular dimensiones
    function calculateDimensions() {
        // Con el nuevo ancho calc(80% - 60px), cada card ocupa 80% del contenedor
        // Para centrar perfectamente, el slideWidth debe ser 100% del contenedor
        slideWidth = container.offsetWidth; // 100% del contenedor para centrado perfecto
        maxTranslateX = 0;
        minTranslateX = -(slideWidth * (slides.length - 1));
    }
    
    // Calculate slide width including margins
    function getSlideWidth() {
        const containerWidth = container.offsetWidth;
        return containerWidth;
    }
    
    // Actualizar posición del carrusel
    function updateCarousel() {
        track.style.transform = `translateX(${currentTranslateX}px)`;
    }
    
    // Mover a la siguiente slide
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        currentTranslateX = -currentSlideIndex * slideWidth;
        
        track.style.transition = 'transform 0.3s ease-out';
        updateCarousel();
        
        setTimeout(() => {
            track.style.transition = 'none';
        }, 300);
    }
    
    // Mover a la slide anterior
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        currentTranslateX = -currentSlideIndex * slideWidth;
        
        track.style.transition = 'transform 0.3s ease-out';
        updateCarousel();
        
        setTimeout(() => {
            track.style.transition = 'none';
        }, 300);
    }
    
    // Iniciar autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }
    
    // Detener autoplay
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    // Snap a la slide más cercana
    function snapToClosestSlide() {
        const slideIndex = Math.round(-currentTranslateX / slideWidth);
        const targetTranslateX = -slideIndex * slideWidth;
        
        // Limitar dentro de los bounds
        currentTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, targetTranslateX));
        currentSlideIndex = Math.round(-currentTranslateX / slideWidth);
        
        track.style.transition = 'transform 0.3s ease-out';
        updateCarousel();
        
        setTimeout(() => {
            track.style.transition = 'none';
        }, 300);
    }
    
    // Eventos de mouse
    function handleMouseDown(e) {
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        currentX = e.clientX;
        initialTransform = currentTranslateX;
        container.style.cursor = 'grabbing';
        track.style.transition = 'none';
        stopAutoplay();
        e.preventDefault();
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        currentX = e.clientX;
        const deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > dragThreshold) {
            hasDragged = true;
        }
        
        currentTranslateX = initialTransform + deltaX;
        
        // Limitar el arrastre
        currentTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, currentTranslateX));
        
        updateCarousel();
    }
    
    function handleMouseUp() {
        if (!isDragging) return;
        
        isDragging = false;
        container.style.cursor = 'grab';
        
        if (hasDragged) {
            snapToClosestSlide();
        }
        
        startAutoplay();
    }
    
    // Eventos de touch
    function handleTouchStart(e) {
        isDragging = true;
        hasDragged = false;
        startX = e.touches[0].clientX;
        currentX = e.touches[0].clientX;
        initialTransform = currentTranslateX;
        track.style.transition = 'none';
        stopAutoplay();
        e.preventDefault();
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > dragThreshold) {
            hasDragged = true;
        }
        
        currentTranslateX = initialTransform + deltaX;
        
        // Limitar el arrastre
        currentTranslateX = Math.max(minTranslateX, Math.min(maxTranslateX, currentTranslateX));
        
        updateCarousel();
        e.preventDefault();
    }
    
    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        
        if (hasDragged) {
            snapToClosestSlide();
        }
        
        startAutoplay();
    }
    
    // Event listeners para botones de navegación móvil
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoplay();
            prevSlide();
            startAutoplay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoplay();
            nextSlide();
            startAutoplay();
        });
    }
    
    // Event listeners para hover - pausar/reanudar autoplay
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
    
    // Event listeners
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Solo habilitar eventos táctiles en desktop (pantallas >= 1280px)
    function checkScreenSize() {
        return window.innerWidth >= 1280;
    }
    
    // Función para agregar/remover eventos táctiles según el tamaño de pantalla
    function updateTouchEvents() {
        if (checkScreenSize()) {
            // Desktop: habilitar eventos táctiles
            container.addEventListener('touchstart', handleTouchStart, { passive: false });
            container.addEventListener('touchmove', handleTouchMove, { passive: false });
            container.addEventListener('touchend', handleTouchEnd);
        } else {
            // Mobile: deshabilitar eventos táctiles
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        }
    }
    
    // Inicializar eventos táctiles según el tamaño de pantalla
    updateTouchEvents();
    
    // Actualizar eventos táctiles cuando cambie el tamaño de pantalla
    window.addEventListener('resize', updateTouchEvents);
    
    // Recalcular dimensiones en resize
    window.addEventListener('resize', () => {
        calculateDimensions();
        snapToClosestSlide();
    });
    
    // Inicializar
    calculateDimensions();
    updateCarousel();
    startAutoplay();
}
    
    // Initialize testimonials carousel
    initTestimonialsCarousel();
    
    // Initialize stacking cards effect
    initStackingCards();
    
    // Initialize mobile menu - DISABLED: Now handled by menu-component.js
    // setupMobileMenu();
    
    // Initialize service events
    setupServiceEvents();
    
    // Navigation scroll effect - Initialize for all pages
    initNavigationColorSystem();
    
    // Modal functionality - delegate to modal-component
    const agendaLlamadaBtn = document.getElementById('agenda-llamada-btn');
    const agendaLlamadaMenu = document.getElementById('agenda-llamada-menu');
    const escribenosBtn = document.getElementById('escribenos-btn');
    const escribenosMenu = document.getElementById('escribenos-menu');
    
    // Open modal events - delegate to modal component
    if (agendaLlamadaBtn) {
        agendaLlamadaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAgendaModal();
        });
    }
    
    if (agendaLlamadaMenu) {
        agendaLlamadaMenu.addEventListener('click', function(e) {
            e.preventDefault();
            openAgendaModal();
        });
    }
    
    if (escribenosBtn) {
        escribenosBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openEscribenosModal();
        });
    }
    
    if (escribenosMenu) {
        escribenosMenu.addEventListener('click', function(e) {
            e.preventDefault();
            openEscribenosModal();
        });
    }
    
    // Mobile menu modal events are now handled by menu-component.js
    // Removed duplicate event listeners to prevent conflicts
    
    // Limpiar la animación cuando se cierre la página
    window.addEventListener('beforeunload', function() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
});

// Mobile menu functionality - REMOVED: Now handled entirely by menu-component.js

// Efecto hover dinámico para los servicios
function setupServiceEvents() {
    const serviceItems = document.querySelectorAll('.service-item');
    
    if (!serviceItems.length) return;
    
    // Función para detectar si estamos en desktop (xl breakpoint)
    function isDesktop() {
        return window.innerWidth >= 1280;
    }
    
    // Función para activar un servicio
    function activateService(activeItem) {
        const desktop = isDesktop();
        
        serviceItems.forEach(item => {
            const img = item.querySelector('img');
            const paragraph = item.querySelector('p');
            const link = item.querySelector('a');
            
            if (item === activeItem) {
                if (desktop) {
                    // Desktop: expandir ancho
                    item.classList.remove('xl:w-[16.6%]');
                    item.classList.add('xl:w-[33.3%]');
                } else {
                    // Mobile: expandir altura
                    item.classList.remove('h-[120px]');
                    item.classList.add('h-[300px]');
                }
                
                // Remover blur y grayscale de la imagen
                img.classList.remove('blur-sm', 'grayscale');
                
                // Mostrar contenido con delay para que aparezca después de la expansión
                setTimeout(() => {
                    paragraph.classList.remove('hidden');
                    paragraph.classList.remove('opacity-0');
                    paragraph.classList.add('opacity-100');
                    link.classList.remove('hidden');
                    link.classList.remove('opacity-0');
                    link.classList.add('opacity-100');
                }, 250);
            } else {
                // Servicios inactivos - ocultar contenido instantáneamente
                paragraph.classList.add('hidden');
                paragraph.classList.remove('opacity-100');
                paragraph.classList.add('opacity-0');
                link.classList.add('hidden');
                link.classList.remove('opacity-100');
                link.classList.add('opacity-0');
                
                if (desktop) {
                    // Desktop: contraer ancho
                    item.classList.remove('xl:w-[33.3%]');
                    item.classList.add('xl:w-[16.6%]');
                } else {
                    // Mobile: contraer altura
                    item.classList.remove('h-[300px]');
                    item.classList.add('h-[120px]');
                }
                
                // Aplicar blur y grayscale
                img.classList.add('blur-sm', 'grayscale');
            }
        });
    }
    
    // Event listeners según el dispositivo
    function setupEventListeners() {
        const desktop = isDesktop();
        
        serviceItems.forEach(item => {
            // Remover listeners previos
            item.removeEventListener('mouseenter', item._hoverHandler);
            item.removeEventListener('click', item._clickHandler);
            
            if (desktop) {
                // Desktop: usar hover
                item._hoverHandler = () => activateService(item);
                item.addEventListener('mouseenter', item._hoverHandler);
            } else {
                // Mobile: usar click/touch
                item._clickHandler = () => activateService(item);
                item.addEventListener('click', item._clickHandler);
            }
        });
    }
    
    // Configurar listeners iniciales
    setupEventListeners();
    
    // Reconfigurar en resize
    window.addEventListener('resize', setupEventListeners);
    
    // Establecer Foundation como activo por defecto
    const foundationService = document.querySelector('[data-service="foundation"]');
    if (foundationService) {
        activateService(foundationService);
    }
}

// Global modal functions
function openAgendaModal() {
    const modalComponent = document.querySelector('modal-component');
    if (modalComponent) {
        modalComponent.openAgendaModal();
    }
}

function openEscribenosModal() {
    const modalComponent = document.querySelector('modal-component');
    if (modalComponent) {
        modalComponent.openEscribenosModal();
    }
}

// Navigation color system - works on all pages
function initNavigationColorSystem() {
    const nav = document.getElementById('main-nav');
    const navLine = document.getElementById('nav-line');
    const serviciosBtn = document.getElementById('servicios-btn');
    const casosBtn = document.getElementById('casos-btn');
    const equipoBtn = document.getElementById('equipo-btn');
    const contactoBtn = document.getElementById('contacto-btn');
    
    // Only initialize if nav elements exist
    if (!nav || !navLine || !serviciosBtn || !casosBtn || !equipoBtn || !contactoBtn) {
        return;
    }
    
    // Function to get background color brightness
    function getBackgroundBrightness() {
        // Get the element behind the nav (at nav position)
        const navRect = nav.getBoundingClientRect();
        const elementBehind = document.elementFromPoint(navRect.left + navRect.width / 2, navRect.top + navRect.height + 10);
        
        if (!elementBehind) return 255; // Default to light
        
        console.log('Element behind nav:', elementBehind.tagName, elementBehind.className);
        
        // Check if we're over a hero section with dark background
        if (elementBehind.closest('section') && 
            (elementBehind.closest('section').classList.contains('bg-black') || 
             elementBehind.closest('section').querySelector('img[src*="bg"]'))) {
            console.log('Detected hero section with dark background');
            return 50; // Force dark background detection
        }
        
        // Get computed background color
        const computedStyle = window.getComputedStyle(elementBehind);
        let backgroundColor = computedStyle.backgroundColor;
        
        console.log('Initial background color:', backgroundColor);
        
        // If transparent, check parent elements
        let currentElement = elementBehind;
        let depth = 0;
        while ((backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') && depth < 10) {
            currentElement = currentElement.parentElement;
            if (!currentElement || currentElement === document.body) {
                backgroundColor = 'rgb(255, 255, 255)'; // Default to white
                break;
            }
            backgroundColor = window.getComputedStyle(currentElement).backgroundColor;
            console.log('Parent element:', currentElement.tagName, 'background:', backgroundColor);
            depth++;
        }
        
        // Parse RGB values
        const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!rgbMatch) return 255; // Default to light
        
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        // Calculate brightness using luminance formula
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        console.log('Final RGB:', r, g, b, 'Brightness:', brightness);
        return brightness;
    }
    
    // Function to change nav colors based on background
    function updateNavColors() {
        const brightness = getBackgroundBrightness();
        const isDarkBackground = brightness < 128; // Threshold for dark/light
        
        console.log('Brightness detected:', brightness, 'isDark:', isDarkBackground);
        
        if (isDarkBackground) {
            // Dark background - use light colors
            console.log('Applying light colors for dark background');
            navLine.classList.remove('bg-black');
            navLine.classList.add('bg-white');
            serviciosBtn.classList.remove('text-black');
            serviciosBtn.classList.add('text-white');
            casosBtn.classList.remove('text-black');
            casosBtn.classList.add('text-white');
            equipoBtn.classList.remove('text-black');
            equipoBtn.classList.add('text-white');
            contactoBtn.classList.remove('text-black');
            contactoBtn.classList.add('text-white');
        } else {
            // Light background - use dark colors
            console.log('Applying dark colors for light background');
            navLine.classList.remove('bg-white');
            navLine.classList.add('bg-black');
            serviciosBtn.classList.remove('text-white');
            serviciosBtn.classList.add('text-black');
            casosBtn.classList.remove('text-white');
            casosBtn.classList.add('text-black');
            equipoBtn.classList.remove('text-white');
            equipoBtn.classList.add('text-black');
            contactoBtn.classList.remove('text-white');
            contactoBtn.classList.add('text-black');
        }
    }
    
    // Scroll event listener with throttling for performance
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateNavColors();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    updateNavColors();
}

// Stacking Cards Scroll Effect
function initStackingCards() {
    const triggers = document.querySelectorAll('.scroll-trigger');
    const cards = document.querySelectorAll('.stacking-card');
    
    if (!triggers.length || !cards.length) return;
    
    let currentCard = -1;
    let maxCardReached = -1; // Track the highest card that has been shown
    
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';
    let lastTriggerReached = false; // Flag to track if last trigger was reached
    
    function updateCardsOnScroll() {
        const currentScrollY = window.scrollY;
        scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentScrollY;
        
        const viewportHeight = window.innerHeight;
        let activeCard = -1;
        
        // Check which trigger is currently in view
        triggers.forEach((trigger, index) => {
            const rect = trigger.getBoundingClientRect();
            const triggerCenter = rect.top + rect.height / 2;
            
            // If trigger center is in viewport, this card should be active
            if (triggerCenter >= 0 && triggerCenter <= viewportHeight) {
                activeCard = index;
                
                // Check if we've reached the last trigger
                if (index === triggers.length - 1) {
                    lastTriggerReached = true;
                }
                
                // If we're scrolling up and see the last trigger again, reactivate the effect
                if (scrollDirection === 'up' && index === triggers.length - 1 && lastTriggerReached) {
                    lastTriggerReached = false;
                    maxCardReached = index;
                }
            }
        });
        
        // If last trigger was reached, always show the last card
        if (lastTriggerReached) {
            activeCard = cards.length - 1;
        }
        // If no trigger is active and last trigger hasn't been reached
        else if (activeCard === -1) {
            const lastTrigger = triggers[triggers.length - 1];
            const lastTriggerRect = lastTrigger.getBoundingClientRect();
            const stackingSection = document.querySelector('.stacking-cards-container').closest('section');
            const sectionRect = stackingSection.getBoundingClientRect();
            
            // When scrolling down, keep showing the last card indefinitely
            // When scrolling up, only hide if we're well above the section
            if (scrollDirection === 'down' && lastTriggerRect.bottom < 0) {
                activeCard = cards.length - 1;
            } else if (scrollDirection === 'up' && sectionRect.bottom < -viewportHeight) {
                activeCard = -1;
            } else if (lastTriggerRect.bottom < 0 && sectionRect.bottom > -viewportHeight) {
                activeCard = cards.length - 1;
            }
        }
        
        // Update maxCardReached only when scrolling down
        if (activeCard > maxCardReached) {
            maxCardReached = activeCard;
        }
        // When scrolling up, reduce maxCardReached to match activeCard only if activeCard is valid and last trigger hasn't been reached
        else if (activeCard !== -1 && activeCard < maxCardReached && scrollDirection === 'up' && !lastTriggerReached) {
            maxCardReached = activeCard;
        }
        
        // Only update if active card changed
        if (activeCard !== currentCard) {
            currentCard = activeCard;
            
            cards.forEach((card, index) => {
                // Remove all classes first
                card.classList.remove('card-hidden', 'card-visible', 'card-stacked', 'card-final');
                
                // Set z-index for proper stacking (later cards on top)
                card.style.zIndex = index + 1;
                
                if (activeCard !== -1) {
                    if (index === currentCard) {
                        // Only current card is visible
                        if (currentCard === cards.length - 1) {
                            card.classList.add('card-final');
                        } else {
                            card.classList.add('card-visible');
                        }
                    } else {
                        // All other cards are hidden with scale and opacity effect
                        card.classList.add('card-hidden');
                    }
                } else {
                    // Cards that shouldn't be shown yet are hidden
                    card.classList.add('card-hidden');
                }
            });
        }
    }
    
    // Throttled scroll handler
    let ticking = false;
    function handleStackingScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateCardsOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', handleStackingScroll);
    
    // Initial check
    updateCardsOnScroll();
}

// Duplicate DOMContentLoaded block removed - functionality moved to main DOMContentLoaded block above