document.addEventListener('DOMContentLoaded', () => {

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Video Player Carousel for Viral Reels ---
    const videos = document.querySelectorAll('.viral-video');
    let currentVideoIndex = 0;
    let isPlaying = false;

    // Play/pause functionality
    const videoOverlay = document.querySelector('.video-overlay');
    if (videoOverlay) {
        videoOverlay.addEventListener('click', function () {
            const activeVideo = document.querySelector('.viral-video.active');
            if (activeVideo) {
                if (activeVideo.paused) {
                    activeVideo.play();
                    activeVideo.classList.add('playing');
                    isPlaying = true;
                } else {
                    activeVideo.pause();
                    activeVideo.classList.remove('playing');
                    isPlaying = false;
                }
            }
        });
    }

    window.changeVideo = function (direction) {
        // Pause current video
        const currentVideo = videos[currentVideoIndex];
        if (currentVideo) {
            currentVideo.pause();
            currentVideo.currentTime = 0;
            currentVideo.classList.remove('active', 'playing');
        }

        // Calculate new index
        currentVideoIndex = (currentVideoIndex + direction + videos.length) % videos.length;

        // Show new video
        const newVideo = videos[currentVideoIndex];
        if (newVideo) {
            newVideo.classList.add('active');

            // Update counter
            const counterEl = document.querySelector('.current-video');
            if (counterEl) {
                counterEl.textContent = currentVideoIndex + 1;
            }

            // Update view count
            const viewCountEl = document.querySelector('.view-count');
            if (viewCountEl && newVideo.dataset.views) {
                viewCountEl.textContent = newVideo.dataset.views;
            }

            // Auto-play if previous was playing
            if (isPlaying) {
                setTimeout(() => {
                    newVideo.play();
                    newVideo.classList.add('playing');
                }, 100);
            }
        }
    };

    // Fullscreen functionality
    window.toggleFullscreen = function () {
        const videoWrapper = document.querySelector('.video-wrapper');
        const activeVideo = document.querySelector('.viral-video.active');

        if (!document.fullscreenElement) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen();
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen();
            }

            // Auto-play when entering fullscreen
            if (activeVideo && activeVideo.paused) {
                activeVideo.play();
                activeVideo.classList.add('playing');
                isPlaying = true;
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    // Update fullscreen button icon
    document.addEventListener('fullscreenchange', function () {
        const fullscreenBtn = document.querySelector('.fullscreen-btn ion-icon');
        if (fullscreenBtn) {
            if (document.fullscreenElement) {
                fullscreenBtn.setAttribute('name', 'contract-outline');
            } else {
                fullscreenBtn.setAttribute('name', 'expand-outline');
            }
        }
    });

    // Initialize first video
    if (videos.length > 0) {
        videos[0].classList.add('active');
    }

    // --- Particle Network Animation (Canvas) ----
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        // Configuration
        const particleCount = 60; // Number of dots
        const connectionDistance = 150; // Max distance to connect
        const mouseDistance = 200; // Mouse interaction radius

        // Resize handling
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Mouse tracking
        const mouse = { x: null, y: null };
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = Math.random() > 0.5 ? '#7c3aed' : '#2563eb'; // Brand colors
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouseDistance) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouseDistance - distance) / mouseDistance;
                        const directionX = forceDirectionX * force * 0.5;
                        const directionY = forceDirectionY * force * 0.5;
                        this.vx += directionX; // Gentle push/pull
                        this.vy += directionY;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });


            connect();

            requestAnimationFrame(animate);
        };

        const connect = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        let opacityValue = 1 - (distance / connectionDistance);
                        ctx.strokeStyle = 'rgba(124, 58, 237, ' + opacityValue * 0.2 + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        animate();
    }


    // --- Mobile Menu Toggle (Floating Pill) ---
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    const floatingNav = document.querySelector('.floating-nav');

    if (mobileBtn && floatingNav) {
        mobileBtn.addEventListener('click', () => {
            floatingNav.classList.toggle('mobile-active');

            // Toggle icon
            const icon = mobileBtn.querySelector('ion-icon');
            if (floatingNav.classList.contains('mobile-active')) {
                icon.setAttribute('name', 'close-outline');
            } else {
                icon.setAttribute('name', 'menu-outline');
            }
        });

        // Close menu when a link is clicked
        const navLinks = floatingNav.querySelectorAll('.nav-link-item, .nav-cta-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                floatingNav.classList.remove('mobile-active');
                const icon = mobileBtn.querySelector('ion-icon');
                if (icon) icon.setAttribute('name', 'menu-outline');
            });
        });
    }

    // --- Professional Video Player Logic ---
    window.toggleVideoPlay = function (overlay) {
        const player = overlay.closest('.custom-video-player');
        const video = player.querySelector('.carousel-video');
        const playBtn = player.querySelector('.play-btn ion-icon');
        const overlayIcon = overlay.querySelector('.play-icon ion-icon');

        if (video.paused) {
            video.play();
            playBtn.setAttribute('name', 'pause');
            overlayIcon.setAttribute('name', 'pause');
            overlay.style.opacity = '0';
        } else {
            video.pause();
            playBtn.setAttribute('name', 'play');
            overlayIcon.setAttribute('name', 'play');
            overlay.style.opacity = '1';
        }
    };

    window.toggleMute = function (btn) {
        const video = btn.closest('.custom-video-player').querySelector('.carousel-video');
        const icon = btn.querySelector('ion-icon');

        if (video.muted) {
            video.muted = false;
            icon.setAttribute('name', 'volume-medium');
        } else {
            video.muted = true;
            icon.setAttribute('name', 'volume-mute');
        }
    };

    window.seekVideo = function (e, container) {
        const video = container.closest('.custom-video-player').querySelector('.carousel-video');
        const rect = container.getBoundingClientRect();
        const pos = (e.pageX - rect.left) / container.offsetWidth;
        video.currentTime = pos * video.duration;
    };

    // Update progress bars
    document.querySelectorAll('.carousel-video').forEach(video => {
        // Ensure loop is set
        video.loop = true;

        video.addEventListener('timeupdate', () => {
            const player = video.closest('.custom-video-player');
            const bar = player.querySelector('.progress-bar');
            if (video.duration) {
                const percent = (video.currentTime / video.duration) * 100;
                bar.style.width = `${percent}%`;
            }
        });

        // Reset UI when video finishes (fallback if loop doesn't catch)
        video.addEventListener('ended', () => {
            if (video.loop) {
                video.currentTime = 0;
                video.play();
            } else {
                const player = video.closest('.custom-video-player');
                const overlay = player.querySelector('.video-overlay');
                const playBtn = player.querySelector('.play-btn ion-icon');
                const overlayIcon = overlay.querySelector('.play-icon ion-icon');

                playBtn.setAttribute('name', 'play');
                overlayIcon.setAttribute('name', 'play');
                overlay.style.opacity = '1';
            }
        });
    });

    // --- Video Carousel Navigation ---
    let contentSlideIndex = 0;
    let influencerSlideIndex = 0;

    window.changeVideoSlide = function (direction) {
        const carousel = document.getElementById('content-video-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.carousel-slide');
        const currentSlideEl = carousel.querySelector('.current-slide');
        const totalSlides = slides.length;

        if (!slides.length) return;

        // Reset current video UI
        const currentVideo = slides[contentSlideIndex].querySelector('.carousel-video');
        const currentPlayer = slides[contentSlideIndex].querySelector('.custom-video-player');
        if (currentVideo) {
            currentVideo.pause();
            if (currentPlayer) {
                const overlay = currentPlayer.querySelector('.video-overlay');
                const playBtn = currentPlayer.querySelector('.play-btn ion-icon');
                const overlayIcon = overlay.querySelector('.play-icon ion-icon');
                playBtn.setAttribute('name', 'play');
                overlayIcon.setAttribute('name', 'play');
                overlay.style.opacity = '1';
            }
        }

        // Remove active class from current slide
        slides[contentSlideIndex].classList.remove('active');

        // Calculate new index with wrapping
        contentSlideIndex = (contentSlideIndex + direction + totalSlides) % totalSlides;

        // Add active class to new slide
        slides[contentSlideIndex].classList.add('active');

        // Auto-play new video
        const newVideo = slides[contentSlideIndex].querySelector('.carousel-video');
        const newPlayer = slides[contentSlideIndex].querySelector('.custom-video-player');
        if (newVideo) {
            newVideo.play().then(() => {
                if (newPlayer) {
                    const overlay = newPlayer.querySelector('.video-overlay');
                    const playBtn = newPlayer.querySelector('.play-btn ion-icon');
                    const overlayIcon = overlay.querySelector('.play-icon ion-icon');
                    playBtn.setAttribute('name', 'pause');
                    overlayIcon.setAttribute('name', 'pause');
                    overlay.style.opacity = '0';
                }
            }).catch(err => console.log('Auto-play prevented:', err));
        }

        // Update counter
        if (currentSlideEl) {
            currentSlideEl.textContent = contentSlideIndex + 1;
        }
    };

    window.changeInfluencerVideoSlide = function (direction) {
        const carousel = document.getElementById('influencer-video-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.carousel-slide');
        const currentSlideEl = carousel.querySelector('.current-slide');
        const totalSlidesInfluencer = slides.length;

        if (!slides.length) return;

        // Reset current video UI
        const currentVideo = slides[influencerSlideIndex].querySelector('.carousel-video');
        const currentPlayer = slides[influencerSlideIndex].querySelector('.custom-video-player');
        if (currentVideo) {
            currentVideo.pause();
            if (currentPlayer) {
                const overlay = currentPlayer.querySelector('.video-overlay');
                const playBtn = currentPlayer.querySelector('.play-btn ion-icon');
                const overlayIcon = overlay.querySelector('.play-icon ion-icon');
                playBtn.setAttribute('name', 'play');
                overlayIcon.setAttribute('name', 'play');
                overlay.style.opacity = '1';
            }
        }

        // Remove active class from current slide
        slides[influencerSlideIndex].classList.remove('active');

        // Calculate new index with wrapping
        influencerSlideIndex = (influencerSlideIndex + direction + totalSlidesInfluencer) % totalSlidesInfluencer;

        // Add active class to new slide
        slides[influencerSlideIndex].classList.add('active');

        // Auto-play new video
        const newVideo = slides[influencerSlideIndex].querySelector('.carousel-video');
        const newPlayer = slides[influencerSlideIndex].querySelector('.custom-video-player');
        if (newVideo) {
            newVideo.play().then(() => {
                if (newPlayer) {
                    const overlay = newPlayer.querySelector('.video-overlay');
                    const playBtn = newPlayer.querySelector('.play-btn ion-icon');
                    const overlayIcon = overlay.querySelector('.play-icon ion-icon');
                    playBtn.setAttribute('name', 'pause');
                    overlayIcon.setAttribute('name', 'pause');
                    overlay.style.opacity = '0';
                }
            }).catch(err => console.log('Auto-play prevented:', err));
        }

        // Update counter
        if (currentSlideEl) {
            currentSlideEl.textContent = influencerSlideIndex + 1;
        }
    };

    // --- FAQ Accordion Toggle ---
    window.toggleFAQ = function (questionElement) {
        const faqItem = questionElement.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Toggle current item
        if (isActive) {
            faqItem.classList.remove('active');
        } else {
            faqItem.classList.add('active');
        }
    };

    // --- Premium Enhancements: Counters & Parallax ---

    // 1. Number Counter Animation
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.getAttribute('data-target'));
                const suffix = counter.getAttribute('data-suffix') || '';
                const duration = 2000; // ms
                const start = 0;
                const startTime = performance.now();

                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease out quart
                    const ease = 1 - Math.pow(1 - progress, 4);

                    const current = start + (target - start) * ease;

                    // Format number: if integer, show integer, else 1 decimal
                    const formatted = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);

                    counter.innerText = (target > 0 ? '+' : '') + formatted + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = (target > 0 ? '+' : '') + target + suffix;
                    }
                };

                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter-anim').forEach(counter => {
        counterObserver.observe(counter);
    });

    // 2. 3D Tilt / Parallax on Mouse Move
    const parallaxContainers = document.querySelectorAll('.feature-visual');

    parallaxContainers.forEach(container => {
        container.addEventListener('mousemove', (e) => {
            const card = container.querySelector('.dashboard-visual, .video-carousel');
            if (!card) return;

            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation degrees (max 10deg)
            const xPct = x / rect.width;
            const yPct = y / rect.height;

            const rotateX = (0.5 - yPct) * 10;
            const rotateY = (xPct - 0.5) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        container.addEventListener('mouseleave', () => {
            const card = container.querySelector('.dashboard-visual, .video-carousel');
            if (!card) return;
            // Reset
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0)`;
        });
    });

});

