 // ===== LIQUID GRADIENT BACKGROUND =====
        class LiquidGradient {
            constructor() {
                this.canvas = document.getElementById('gradientCanvas');
                this.renderer = new THREE.WebGLRenderer({
                    canvas: this.canvas,
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance"
                });
                
                this.scene = new THREE.Scene();
                this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
                this.clock = new THREE.Clock();
                
                this.mouse = new THREE.Vector2(0.5, 0.5);
                this.targetMouse = new THREE.Vector2(0.5, 0.5);
                
                this.init();
            }
            
            init() {
                this.setupRenderer();
                this.createGradient();
                this.setupEventListeners();
                this.animate();
            }
            
            setupRenderer() {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
            
            createGradient() {
                const uniforms = {
                    uTime: { value: 0 },
                    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
                };
                
                const material = new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: `
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float uTime;
                        uniform vec2 uResolution;
                        uniform vec2 uMouse;
                        varying vec2 vUv;
                        
                        #define PI 3.14159265359
                        
                        vec3 palette(float t) {
                            vec3 a = vec3(1.0, 1.0, 1.0);
                            vec3 b = vec3(0.0, 0.0, 0.0);
                            vec3 c = vec3(1.0, 1.0, 1.0);
                            vec3 d = vec3(0.5, 0.5, 0.5);
                            
                            return a + b * cos(2.0 * PI * (c * t + d));
                        }
                        
                        float noise(vec2 p) {
                            return sin(p.x * 10.0) * sin(p.y * 10.0);
                        }
                        
                        void main() {
                            vec2 uv = (vUv - 0.5) * 2.0;
                            uv.x *= uResolution.x / uResolution.y;
                            
                            vec2 mouse = (uMouse - 0.5) * 2.0;
                            mouse.x *= uResolution.x / uResolution.y;
                            
                            vec3 finalColor = vec3(0.0);
                            
                            // Create multiple gradient layers
                            for(float i = 0.0; i < 3.0; i++) {
                                vec2 q = uv;
                                q.x += 0.2 / (i + 1.0) * sin(i * 2.5 * uv.y + uTime * 0.4);
                                q.y += 0.2 / (i + 1.0) * sin(i * 2.5 * uv.x + uTime * 0.5);
                                
                                float d = length(q + mouse * 0.4);
                                d = sin(d * 10.0 + uTime) / 10.0;
                                d = abs(d);
                                d = pow(0.01 / d, 1.2);
                                
                                vec3 col = palette(length(q) + i * 0.4 + uTime * 0.4);
                                finalColor += col * d * 0.6;
                            }
                            
                            // Add mouse interaction effect
                            vec2 mouseDist = uv - mouse * 0.5;
                            float mouseEffect = smoothstep(0.7, 0.0, length(mouseDist));
                            finalColor += vec3(0.8, 0.8, 0.8) * mouseEffect * 0.3;
                            
                            // Add subtle noise
                            float n = noise(uv * 2.0 + uTime * 0.1) * 0.05;
                            finalColor += n;
                            
                            // Soft vignette
                            float vignette = 1.0 - length(vUv - 0.5) * 0.6;
                            vignette = pow(vignette, 1.5);
                            finalColor *= vignette;
                            
                            // Black and white theme
                            float grayscale = dot(finalColor, vec3(0.299, 0.587, 0.114));
                            finalColor = vec3(grayscale);
                            
                            // Adjust contrast
                            finalColor = pow(finalColor, vec3(1.5));
                            finalColor = clamp(finalColor, vec3(0.0), vec3(1.0));
                            
                            gl_FragColor = vec4(finalColor, 1.0);
                        }
                    `
                });
                
                const geometry = new THREE.PlaneGeometry(2, 2);
                const plane = new THREE.Mesh(geometry, material);
                this.scene.add(plane);
                
                this.material = material;
            }
            
            setupEventListeners() {
                window.addEventListener('resize', () => this.onResize());
                
                window.addEventListener('mousemove', (e) => {
                    this.targetMouse.x = e.clientX / window.innerWidth;
                    this.targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
                });
                
                window.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    this.targetMouse.x = touch.clientX / window.innerWidth;
                    this.targetMouse.y = 1.0 - (touch.clientY / window.innerHeight);
                }, { passive: false });
            }
            
            animate() {
                requestAnimationFrame(() => this.animate());
                
                // Smooth mouse movement
                this.mouse.lerp(this.targetMouse, 0.05);
                
                // Update uniforms
                this.material.uniforms.uTime.value = this.clock.getElapsedTime();
                this.material.uniforms.uMouse.value.copy(this.mouse);
                
                this.renderer.render(this.scene, this.camera);
            }
            
            onResize() {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
            }
        }
        
        // ===== CUSTOM CURSOR =====
        class CustomCursor {
            constructor() {
                this.cursor = document.getElementById('customCursor');
                this.mouseX = 0;
                this.mouseY = 0;
                this.cursorX = 0;
                this.cursorY = 0;
                this.speed = 0.2;
                
                if (window.matchMedia("(hover: hover)").matches) {
                    this.init();
                }
            }
            
            init() {
                this.cursor.style.display = 'block';
                document.body.classList.add('cursor-hidden');
                
                document.addEventListener('mousemove', (e) => {
                    this.mouseX = e.clientX;
                    this.mouseY = e.clientY;
                    document.body.classList.remove('cursor-hidden');
                });
                
                // Hover effects for fan stack cards and project cards
                const hoverElements = document.querySelectorAll('a, button, .skills-card p, .main .card');
                hoverElements.forEach(el => {
                    el.addEventListener('mouseenter', () => {
                        this.cursor.classList.add('hover');
                    });
                    
                    el.addEventListener('mouseleave', () => {
                        this.cursor.classList.remove('hover');
                    });
                });
                
                this.animate();
            }
            
            animate() {
                this.cursorX += (this.mouseX - this.cursorX) * this.speed;
                this.cursorY += (this.mouseY - this.cursorY) * this.speed;
                
                this.cursor.style.left = this.cursorX + 'px';
                this.cursor.style.top = this.cursorY + 'px';
                
                requestAnimationFrame(() => this.animate());
            }
        }
        
        // ===== THEME MANAGER ===== (KEEPING YOUR ORIGINAL)
        class ThemeManager {
            constructor() {
                this.themeToggle = document.getElementById('themeToggle');
                this.themeIcon = this.themeToggle.querySelector('i');
                this.body = document.body;
                this.currentTheme = localStorage.getItem('theme') || 'dark';
                
                this.init();
            }
            
            init() {
                this.setTheme(this.currentTheme);
                this.themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            
            setTheme(theme) {
                this.currentTheme = theme;
                
                if (theme === 'light') {
                    this.body.classList.add('light-theme');
                    this.themeIcon.className = 'fas fa-sun';
                    this.themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
                } else {
                    this.body.classList.remove('light-theme');
                    this.themeIcon.className = 'fas fa-moon';
                    this.themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
                }
                
                localStorage.setItem('theme', theme);
            }
            
            toggleTheme() {
                this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
            }
        }
        
        // ===== SCROLL ANIMATIONS =====
        class ScrollAnimations {
            constructor() {
                this.observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };
                
                this.init();
            }
            
            init() {
                this.setupIntersectionObserver();
                this.setupNavbarScroll();
                this.setupSmoothScroll();
            }
            
            setupIntersectionObserver() {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('fade-in-up');
                        }
                    });
                }, this.observerOptions);
                
                document.querySelectorAll('.fade-in-up').forEach(el => {
                    observer.observe(el);
                });
            }
            
            setupNavbarScroll() {
                const navbar = document.querySelector('.navbar');
                window.addEventListener('scroll', () => {
                    const scrollTop = window.pageYOffset;
                    
                    if (scrollTop > 100) {
                        navbar.style.backgroundColor = 'var(--nav-bg)';
                    } else {
                        navbar.style.backgroundColor = '';
                    }
                });
            }
            
            setupSmoothScroll() {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', (e) => {
                        const targetId = anchor.getAttribute('href');
                        if (targetId === '#') return;
                        
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            e.preventDefault();
                            window.scrollTo({
                                top: targetElement.offsetTop - 80,
                                behavior: 'smooth'
                            });
                            
                            // Update active nav link
                            document.querySelectorAll('.nav-link').forEach(link => {
                                link.classList.remove('active');
                            });
                            anchor.classList.add('active');
                        }
                    });
                });
            }
        }
        
        // ===== PROJECT CARDS FAN STACK EFFECT ===== (KEEPING YOUR ORIGINAL)
        class ProjectCards {
            constructor() {
                this.projectCards = document.querySelectorAll('.main');
                this.init();
            }
            
            init() {
                this.projectCards.forEach(main => {
                    const cards = main.querySelectorAll('.card');
                    
                    main.addEventListener('mouseenter', () => {
                        this.spreadCards(cards);
                    });
                    
                    main.addEventListener('mouseleave', () => {
                        this.resetCards(cards);
                    });
                });
            }
            
            spreadCards(cards) {
                if (cards.length === 3) {
                    cards[0].style.transform = 'translateX(-60px) rotate(-10deg)';
                    cards[1].style.transform = 'translateX(0px) rotate(-5deg)';
                    cards[2].style.transform = 'translateX(60px) rotate(5deg)';
                }
            }
            
            resetCards(cards) {
                if (cards.length === 3) {
                    cards[0].style.transform = 'translateX(0) rotate(0)';
                    cards[1].style.transform = 'translateX(0) rotate(0)';
                    cards[2].style.transform = 'translateX(0) rotate(0)';
                }
            }
        }
        
        // ===== SKILLS CARDS INTERACTION ===== (KEEPING YOUR ORIGINAL)
        class SkillCards {
            constructor() {
                this.skillItems = document.querySelectorAll('.skills-card p');
                this.init();
            }
            
            init() {
                this.skillItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        const skillText = e.currentTarget.querySelector('span').textContent;
                        alert(`Skill: ${skillText}\n\nThis represents my expertise in ${skillText.toLowerCase()}.`);
                    });
                });
            }
        }
        
        // ===== INITIALIZE EVERYTHING =====
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize liquid gradient
            const gradient = new LiquidGradient();
            
            // Initialize custom cursor
            const cursor = new CustomCursor();
            
            // Initialize theme manager
            const themeManager = new ThemeManager();
            
            // Initialize scroll animations
            const scrollAnimations = new ScrollAnimations();
            
            // Initialize your original components
            const projectCards = new ProjectCards();
            const skillCards = new SkillCards();
            
            // Force initial render
            gradient.onResize();
            
            console.log('🎨 Portfolio initialized with Liquid Gradient!');
        });