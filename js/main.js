document.addEventListener('DOMContentLoaded', () => {
    console.log("Aura Perfumería vNext: Iniciando experiencia refinada...");

    // Ejecutar Splitting.js al inicio
    Splitting();

    // --- Pantalla de Carga ---
    const loadingScreen = document.querySelector('.loading-screen');
    const loaderLogo = document.querySelector('.loader-logo');
    if (loadingScreen && loaderLogo) {
        gsap.set(document.body, { className: 'loading' }); // Añadir clase para evitar scroll

        const loadingTl = gsap.timeline();
        loadingTl
            .to(loaderLogo, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' })
            .to(loaderLogo, { opacity: 0, scale: 0.8, duration: 0.8, ease: 'power2.in', delay: 0.5 })
            .to(loadingScreen, {
                opacity: 0,
                duration: 1,
                ease: 'power3.inOut',
                onComplete: () => {
                    loadingScreen.classList.add('hidden');
                    gsap.set(document.body, { className: '-=loading' }); // Remover clase
                    ScrollTrigger.refresh(); // Refrescar ScrollTrigger después de quitar la pantalla de carga
                    if (lenis) lenis.start(); // Asegurar que Lenis esté activo
                }
            });
    }


    // --- Lenis (Smooth Scrolling) ---
    let lenis;
    if (window.Lenis) {
        lenis = new Lenis({
            duration: 1.6, // Ajusta para la sensación deseada (más "pesado")
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Default ease
            // easing: (t) => 1 - Math.pow(1 - t, 4), // EaseOutQuart - alternativa
            smoothTouch: false,
            touchMultiplier: 1.8, // Ligeramente más sensible al tacto
        });

        function raf(time) {
            if (lenis) lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            if (lenis) lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    } else {
        console.warn("Lenis no está definido. El smooth scroll no funcionará.");
    }


    // --- GSAP Plugins ---
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // --- Cursor Personalizado ---
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    const interactiveElements = document.querySelectorAll("a, button, .category-card, .product-card, input[type='email'], .horizontal-panel, .social-icon");

    if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        // document.body.style.cursor = 'none'; // Ya está en CSS

        window.addEventListener("mousemove", function (e) {
            const { clientX: posX, clientY: posY } = e;
            gsap.to(cursorDot, { duration: 0.15, x: posX, y: posY }); // Más rápido
            gsap.to(cursorOutline, { duration: 0.35, x: posX, y: posY, ease: "power1.out" }); // Un poco más suave
        });

        interactiveElements.forEach(el => {
            el.addEventListener("mouseenter", () => {
                let scaleValue = el.classList.contains('horizontal-panel') ? 2.2 : 1.7;
                gsap.to(cursorOutline, { duration: 0.3, scale: scaleValue, opacity: 0.6, borderColor: 'var(--color-accent)', ease: 'power2.out' });
                gsap.to(cursorDot, { duration: 0.3, scale: 0.4, opacity: 0.7, backgroundColor: 'var(--color-accent)', ease: 'power2.out' });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(cursorOutline, { duration: 0.3, scale: 1, opacity: 1, borderColor: 'var(--color-primary)', ease: 'power2.inOut' });
                gsap.to(cursorDot, { duration: 0.3, scale: 1, opacity: 1, backgroundColor: 'var(--color-primary)', ease: 'power2.inOut' });
            });
        });
    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOutline) cursorOutline.style.display = 'none';
        document.body.style.cursor = 'auto';
    }

    // --- Navegación Suave y Activa ---
    const navLinks = document.querySelectorAll('.nav-link-item');
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (lenis && document.querySelector(targetId)) {
                lenis.scrollTo(targetId, {
                    offset: -70, // Ajusta si tu header cambia de altura
                    duration: 2.2,
                    easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
                });
            } else if (document.querySelector(targetId)) { // Fallback si Lenis no existe
                 document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    // Actualizar enlace activo en scroll
    ScrollTrigger.create({
        onUpdate: (self) => {
            const sections = gsap.utils.toArray('section[id]');
            let currentSectionId = '';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) { // 100px de offset para el header
                    currentSectionId = section.id;
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });


    // --- Animación del Header ---
    ScrollTrigger.create({
        start: 'top -80', end: 99999,
        toggleClass: { className: 'scrolled', targets: '.main-header' }
    });

    // --- Animación Logo Header ---
    const logo = document.querySelector('.logo a');
    if (logo) {
        gsap.from(logo, { opacity: 0, y: -25, duration: 1, delay: (loadingScreen ? 2.5 : 0.5), ease: 'expo.out' }); // Delay ajustado por loading screen
        logo.addEventListener('mouseenter', () => gsap.to(logo, { y: -2, rotation: -2, duration: 0.2, ease: 'power1.out' }));
        logo.addEventListener('mouseleave', () => gsap.to(logo, { y: 0, rotation: 0, duration: 0.2, ease: 'power1.inOut' }));
    }

    // --- Animaciones de Títulos de Sección (con Splitting.js) ---
    gsap.utils.toArray('.section-title[data-splitting="chars"]').forEach(title => {
        const chars = title.querySelectorAll('.char');
        if (chars.length > 0) {
            gsap.from(chars, {
                opacity: 0, yPercent: 110, rotationX: -70, scaleY: 1.5, transformOrigin: "top center",
                filter: 'blur(3px)',
                stagger: { each: 0.025, from: "random" },
                duration: 0.8, ease: 'expo.out',
                scrollTrigger: { trigger: title, start: 'top 88%' }
            });
        }
    });

    // --- Hero Section Animación ---
    const heroTitleChars = document.querySelectorAll(".hero-title .char");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroCta = document.querySelector(".btn-hero-cta");
    const heroPerfumeImg = document.querySelector(".hero-perfume-img");
    const heroBgText = document.querySelector('.hero-background-text');

    const heroTl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.2 },
        delay: (loadingScreen ? 2.3 : 0.3) // Delay ajustado por loading screen
    });

    if (heroTitleChars.length > 0) {
        heroTl.from(heroTitleChars, {
            opacity: 0, yPercent: 105, rotationZ: gsap.utils.wrap([-10, 10, -5, 5]), scale: 1.3,
            stagger: { each: 0.035, from: "start" },
            duration: 0.9
        });
    }
    if(heroSubtitle) heroTl.from(heroSubtitle, { opacity: 0, y: 45, duration: 1.1 }, "-=0.7");
    if(heroCta) heroTl.from(heroCta, { opacity: 0, scale: 0.7, y: 35, duration: 1 }, "-=0.7");
    if(heroPerfumeImg) heroTl.from(heroPerfumeImg, {
        opacity: 0, scale: 0.5, rotationZ: -25, rotationY: 40, xPercent: 40,
        transformOrigin: "center 80%", duration: 1.6, ease: "elastic.out(1, 0.45)"
    }, "-=0.9");

    if (heroBgText) {
        gsap.to(heroBgText, {
            yPercent: -40, scale: 1.1, ease: "none",
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1.2 }
        });
        if (window.matchMedia("(pointer: fine)").matches) {
            const heroSection = document.querySelector('.hero-section');
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                const moveX = (x / rect.width - 0.5) * 35; const moveY = (y / rect.height - 0.5) * 25;
                gsap.to(heroBgText, {
                    duration: 0.7, x: moveX,
                    y: moveY + (parseFloat(gsap.getProperty(heroBgText, "yPercent", "px"))), // Mantener parallax Y
                    rotation: (x / rect.width - 0.5) * -2.5, ease: "power1.out"
                });
            });
             heroSection.addEventListener('mouseleave', (e) => {
                gsap.to(heroBgText, {
                    duration: 0.7, x: 0,
                    rotation: 0, ease: "power1.out"
                });
            });
        }
    }

    // --- Tarjetas de Categorías ---
    gsap.utils.toArray(".category-card").forEach((card, index) => {
        const imageWrapper = card.querySelector('.category-image-wrapper');
        const img = imageWrapper.querySelector('img');
        const title = card.querySelector('h3');
        const description = card.querySelector('.category-description');
        const cta = card.querySelector('.category-cta');

        gsap.set([description, cta], { opacity: 0, y: 15 });

        const cardTl = gsap.timeline({
            scrollTrigger: { trigger: card, start: "top 88%" },
            defaults: { duration: 1, ease: "expo.out" }
        });
        cardTl.from(card, { opacity: 0, y: 80, rotationZ: index % 2 === 0 ? -4 : 4, scale: 0.9, transformOrigin: "center bottom" })
            .from(img, { scale: 1.3, opacity: 0, duration: 1.3, ease: "power3.out" }, "-=0.7")
            .from(title, { opacity: 0, y: 25, x: -15, rotationZ: 3, duration: 0.9 }, "-=0.9");

        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -12, scale: 1.02, boxShadow: 'var(--shadow-strong)', duration: 0.35, ease: 'power2.out' });
            gsap.to(img, { scale: 1.1, duration: 0.45, ease: 'power2.out' });
            gsap.to(description, { opacity: 1, y: 0, duration: 0.3, ease: 'circ.out' });
            gsap.to(cta, { opacity: 1, y: 0, duration: 0.3, delay: 0.05, ease: 'circ.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, boxShadow: 'var(--shadow-light)', duration: 0.35, ease: 'power2.inOut' });
            gsap.to(img, { scale: 1, duration: 0.45, ease: 'power2.inOut' });
            gsap.to(description, { opacity: 0, y: 15, duration: 0.3, ease: 'circ.inOut' });
            gsap.to(cta, { opacity: 0, y: 15, duration: 0.3, ease: 'circ.inOut' });
        });
    });
    ScrollTrigger.batch(".category-card", { // Stagger para las tarjetas
        interval: 0.15, batchMax: 3,
        onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, rotationZ:0, scale:1, stagger: 0.1 }),
    });

    // --- Tarjetas de Productos ---
    gsap.utils.toArray(".product-card").forEach(card => {
        const image = card.querySelector('.product-image-wrapper img');
        const button = card.querySelector('.btn-add-to-cart');
        gsap.set(button, { opacity: 0, y: 20, scale: 0.85 });

        const cardTl = gsap.timeline({
            scrollTrigger: { trigger: card, start: "top 88%" },
            defaults: { duration: 0.9, ease: "power3.out" }
        });
        cardTl.from(card, { opacity: 0, y: 70, scale: 0.92 })
            .from(image, { scale: 1.25, opacity: 0, duration: 1.1, ease: "power2.out" }, "-=0.6");

        card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -10, boxShadow: 'var(--shadow-medium)', duration: 0.3, ease: 'power2.out' });
            gsap.to(image, { scale: 1.06, duration: 0.3, ease: 'power2.out' });
            gsap.to(button, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, boxShadow: 'var(--shadow-light)', duration: 0.3, ease: 'power2.inOut' });
            gsap.to(image, { scale: 1, duration: 0.3, ease: 'power2.inOut' });
            gsap.to(button, { opacity: 0, y: 20, scale: 0.85, duration: 0.25, ease: 'power1.in' });
        });
    });
     ScrollTrigger.batch(".product-card", {
        interval: 0.1, batchMax: 3,
        onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, scale:1, stagger: 0.1 }),
    });


    // --- Sección Scroll Horizontal ("El Arte de la Perfumería") ---
    const horizontalSection = document.querySelector('.horizontal-scroll-section');
    const pinWrapper = document.querySelector('.pin-wrapper');
    const horizontalPanelsContainer = document.querySelector('.horizontal-panel-container');
    const horizontalPanels = gsap.utils.toArray(".horizontal-panel");

    if (horizontalSection && pinWrapper && horizontalPanelsContainer && horizontalPanels.length > 0) {
        let scrollWidth = horizontalPanelsContainer.offsetWidth - window.innerWidth;
        let currentPanelColor = gsap.getProperty(horizontalPanels[0] || pinWrapper, "backgroundColor"); // Color inicial

        gsap.to(horizontalPanelsContainer, {
            x: () => -scrollWidth,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: pinWrapper, pin: true, scrub: 1.1,
                start: "top top", end: () => `+=${scrollWidth}`,
                invalidateOnRefresh: true,
                // markers: true, // DEBUG
                onUpdate: self => { // Cambiar fondo del pinWrapper
                    let panelIndex = Math.floor(self.progress * (horizontalPanels.length -0.001)); // -0.001 to avoid index out of bounds at 1 progress
                    let targetPanel = horizontalPanels[panelIndex];
                    if (targetPanel) {
                        let targetColor = gsap.getProperty(targetPanel, "backgroundColor");
                        if (targetColor !== currentPanelColor) {
                            gsap.to(pinWrapper, { backgroundColor: targetColor, duration: 0.5, ease: "power1.inOut" });
                            currentPanelColor = targetColor;
                        }
                    }
                },
            }
        });

        horizontalPanels.forEach((panel, i) => {
            const panelImage = panel.querySelector('img');
            const panelText = panel.querySelector('p');
            const panelTl = gsap.timeline({
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: ScrollTrigger.sortByIndex(gsap.globalTimeline.getChildren(true, true, false))[1], // Puede necesitar ajuste [0] o [1]...
                    start: 'left 70%', end: 'right 30%',
                    toggleActions: "play reverse play reverse",
                    // scrub: 0.6 // Opcional
                }
            });
            panelTl.from(panelImage, { opacity: 0, xPercent: (i % 2 === 0) ? -60 : 60, rotationY: (i % 2 === 0) ? 35 : -35, scale: 0.75, duration: 1.1, ease: 'expo.out' })
                   .from(panelText, { opacity: 0, xPercent: (i % 2 === 0) ? 35 : -35, yPercent: 15, filter: 'blur(2px)', duration: 0.9, ease: 'power3.out' }, "-=0.75");
        });
    }

    // --- Sección Filosofía ---
    const philosophyTextElements = document.querySelectorAll(".philosophy-text > p");
    const philosophyCta = document.querySelector(".btn-philosophy-cta");
    const philosophyImage = document.querySelector(".philosophy-main-image");

    if (philosophyTextElements.length > 0) {
        gsap.from(philosophyTextElements, {
            scrollTrigger: { trigger: ".philosophy-text", start: "top 80%" },
            opacity: 0, x: -50, filter: 'blur(4px)', duration: 1, stagger: 0.18, ease: "circ.out"
        });
    }
    if (philosophyCta) {
         gsap.from(philosophyCta, {
            scrollTrigger: { trigger: philosophyCta, start: "top 90%" },
            opacity: 0, scale: 0.75, y: 25, duration: 0.8, ease: "back.out(1.5)"
        });
    }
    if (philosophyImage) {
        gsap.fromTo(philosophyImage,
            { opacity: 0, scale: 0.8, rotationY: 50, rotationX:10, transformOrigin: "center 70%", filter: 'brightness(0.4) contrast(1.2)' },
            { opacity: 1, scale: 1, rotationY: 0, rotationX:0, filter: 'brightness(1) contrast(1)',
              duration: 1.5, ease: 'expo.out',
              scrollTrigger: { trigger: ".philosophy-image-wrapper", start: 'top 80%' }
            }
        );
    }

    // --- Sección Parallax ---
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg && parallaxBg.dataset.bgSrc) {
        parallaxBg.style.backgroundImage = `url(${parallaxBg.dataset.bgSrc})`;
        gsap.to(parallaxBg, {
            backgroundPosition: "50% 160%", scale: 1.15, ease: "none",
            scrollTrigger: { trigger: ".parallax-section", start: "top bottom", end: "bottom top", scrub: 0.8 }
        });
    }
    const parallaxQuoteChars = document.querySelectorAll('.parallax-content h3 .char');
    if (parallaxQuoteChars.length > 0) {
        gsap.from(parallaxQuoteChars, {
            opacity: 0,
            yPercent: gsap.utils.wrap([-70, 70, -50, 50]), // Flotación
            scale: gsap.utils.wrap([0.7, 1.3, 0.9, 1.1]),
            filter: 'blur(2.5px)',
            rotationZ: gsap.utils.random(-25, 25, 4),
            stagger: { each: 0.025, from: "center" },
            duration: 0.7, ease: 'power2.inOut',
            scrollTrigger: { trigger: ".parallax-content", start: 'top 78%' }
        });
    }

    // --- Sección Contacto ---
    const contactFormTl = gsap.timeline({ scrollTrigger: { trigger: ".contact-section", start: "top 78%" } });
    contactFormTl.from(".contact-subtitle", { opacity: 0, y: 35, duration: 0.8, ease: 'power2.out' })
             .from(".contact-form", { opacity: 0, scale: 0.85, y: 25, duration: 0.8, ease: 'back.out(1.3)' }, "-=0.45");

    // --- Footer Microinteracciones ---
    document.querySelectorAll('.footer-column ul li a, .social-icon').forEach(el => {
        const iconSvg = el.querySelector('svg');
        const originalColor = el.classList.contains('social-icon') ? (iconSvg ? gsap.getProperty(iconSvg, "fill") : '#c0b8ba') : gsap.getProperty(el, "color");

        el.addEventListener('mouseenter', () => {
            if (el.classList.contains('social-icon') && iconSvg) {
                gsap.to(iconSvg, { fill: 'var(--color-text-light)', scale: 1.2, rotate: gsap.utils.random(-10,10), y:-2, duration: 0.25, ease: 'back.out(2)' });
            } else {
                gsap.to(el, { color: 'var(--color-text-light)', opacity: 1, x: 4, duration: 0.2, ease: 'power1.out' });
            }
        });
        el.addEventListener('mouseleave', () => {
             if (el.classList.contains('social-icon') && iconSvg) {
                gsap.to(iconSvg, { fill: originalColor, scale: 1, rotate: 0, y:0, duration: 0.25, ease: 'power1.inOut' });
            } else {
                gsap.to(el, { color: originalColor, opacity: 0.8, x: 0, duration: 0.2, ease: 'power1.inOut' });
            }
        });
    });

    // --- Actualizar Año Footer ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // --- Forzar Refresh de ScrollTrigger al final ---
    // Es importante si hay imágenes o fuentes que tardan en cargar y afectan el layout
    window.addEventListener('load', () => {
        if (typeof ScrollTrigger.refresh === 'function') {
             setTimeout(() => { // Un pequeño timeout extra
                ScrollTrigger.refresh();
                if (lenis) lenis.resize(); // Asegurar que Lenis también se redimensione
                console.log("Aura Perfumería vNext: ScrollTrigger & Lenis refreshed on window load.");
             }, 100);
        }
    });

    console.log("Aura Perfumería vNext: ¡Script principal ejecutado y listo para deslumbrar!");
});