// Theme System (Black & White Only)
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.body = document.body;
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Add event listener
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
        
        // Save preference
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
    }
}

// Project Cards Fan Stack Effect
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

// Skills Cards Interaction
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

// Navbar Scroll Effect
class NavbarController {
    constructor() {
        this.navbar = document.querySelector('.navbar');
        this.lastScrollTop = 0;
        
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    handleScroll() {
        const scrollTop = window.pageYOffset;
        
        if (scrollTop > 100) {
            this.navbar.style.backgroundColor = 'var(--nav-bg)';
        } else {
            this.navbar.style.backgroundColor = '';
        }
        
        this.lastScrollTop = scrollTop;
    }
}

// Typing Effect for Hero
class Typewriter {
    constructor() {
        this.heroTitle = document.querySelector('.hero-content h1');
        if (this.heroTitle) {
            this.init();
        }
    }
    
    init() {
        const originalText = this.heroTitle.textContent;
        this.heroTitle.innerHTML = '';
        this.heroTitle.classList.add('typing');
        this.heroTitle.textContent = originalText;
        
        // Remove cursor after animation
        setTimeout(() => {
            this.heroTitle.style.borderRight = 'none';
        }, 3500);
    }
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new ProjectCards();
    new SkillCards();
    new NavbarController();
    new Typewriter();
    
    console.log('Portfolio initialized - Black & White Theme');
});