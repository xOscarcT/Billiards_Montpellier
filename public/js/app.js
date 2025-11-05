const normalizeId = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
};

const getImagePath = (type, category, id) => {
    const normalizedId = normalizeId(id);
    const paths = {
        jugadores: `./img/jugadores/${normalizedId}.jpg`,
        menu: `./img/menu/${category}/${normalizedId}.jpg`,
        eventos: `./img/eventos/${normalizedId}.jpg`
    };
    return paths[type] || './img/placeholder.jpg';
};

const imageExists = (url, callback) => {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
};

const createPlayerCard = (player) => {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    let badgeClass = 'rank';
    let badgeText = player.puesto;
    
    if (player.puesto === 1) {
        badgeClass = 'gold';
        badgeText = '🥇';
    } else if (player.puesto === 2) {
        badgeClass = 'silver';
        badgeText = '🥈';
    } else if (player.puesto === 3) {
        badgeClass = 'bronze';
        badgeText = '🥉';
    }
    
    const imagePath = getImagePath('jugadores', null, player.id);
    
    card.innerHTML = `
        <img src="${imagePath}" alt="${player.nombre}" loading="lazy" decoding="async" onerror="this.src='public/placeholder.jpg'">
        <div class="player-badge ${badgeClass}">${badgeText}</div>
        <div class="player-info">
            <h3 class="player-name">${player.nombre}</h3>
            <p class="player-text">${player.texto}</p>
        </div>
    `;
    
    return card;
};

const loadPlayers = async () => {
    try {
        const timestamp = Date.now();
        const response = await fetch(`./data/jugadores.json?v=${timestamp}`);
        const players = await response.json();
        
        const container = document.getElementById('players-container');
        container.innerHTML = '';
        
        players.forEach(player => {
            container.appendChild(createPlayerCard(player));
        });
    } catch (error) {
        console.error('Error loading players:', error);
    }
};

const loadGallery = async () => {
    const categories = ['instalaciones', 'barra', 'mesas', 'torneos'];
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    
    for (const category of categories) {
        try {
            const response = await fetch(`./img/galeria/${category}/`);
            const text = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const links = doc.querySelectorAll('a');
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && (href.endsWith('.jpg') || href.endsWith('.png') || href.endsWith('.jpeg'))) {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.dataset.category = category;
                    
                    const img = document.createElement('img');
                    img.src = `./img/galeria/${category}/${href}`;
                    img.alt = `${category} - ${href}`;
                    img.loading = 'lazy';
                    img.decoding = 'async';
                    
                    item.appendChild(img);
                    container.appendChild(item);
                }
            });
        } catch (error) {
            console.log(`Could not load gallery for ${category}`);
        }
    }
    
    loadGalleryFromFileSystem();
};

const loadGalleryFromFileSystem = () => {
    const container = document.getElementById('gallery-container');
    const categories = {
        'instalaciones': ['sala_principal.jpg', 'area_lounge.jpg'],
        'barra': ['barra_principal.jpg', 'servicio_barra.jpg'],
        'mesas': ['mesa_profesional.jpg', 'vista_mesas.jpg'],
        'torneos': ['ceremonia_ganadores.jpg', 'accion_torneo.jpg']
    };
    
    Object.entries(categories).forEach(([category, files]) => {
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.category = category;
            
            const img = document.createElement('img');
            img.src = `./img/galeria/${category}/${file}`;
            img.alt = `${category}`;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.onerror = function() {
                this.style.display = 'none';
                item.remove();
            };
            
            item.appendChild(img);
            container.appendChild(item);
        });
    });
};

const filterGallery = (category) => {
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
};

const createMenuItem = (item, category) => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    
    const imagePath = getImagePath('menu', category, item.id);
    
    menuItem.innerHTML = `
        <img src="${imagePath}" alt="${item.nombre}" loading="lazy" decoding="async" onerror="this.src='./placeholder.jpg'">
        <div class="menu-item-name">${item.nombre}</div>
    `;
    
    return menuItem;
};

const loadMenu = async () => {
    try {
        const timestamp = Date.now();
        const response = await fetch(`./data/menu.json?v=${timestamp}`);
        const menu = await response.json();
        
        const container = document.getElementById('menu-container');
        container.innerHTML = '';
        
        const categoryNames = {
            bebidas: 'Bebidas',
            comidas: 'Comidas',
            licores: 'Licores',
            snacks: 'Snacks',
            promos: 'Promociones'
        };
        
        Object.entries(menu).forEach(([category, items]) => {
            if (items && items.length > 0) {
                const categorySection = document.createElement('div');
                categorySection.className = 'menu-category';
                
                const title = document.createElement('h3');
                title.className = 'subsection-title';
                title.textContent = categoryNames[category] || category;
                
                const grid = document.createElement('div');
                grid.className = 'menu-grid';
                
                items.forEach(item => {
                    grid.appendChild(createMenuItem(item, category));
                });
                
                categorySection.appendChild(title);
                categorySection.appendChild(grid);
                container.appendChild(categorySection);
            }
        });
    } catch (error) {
        console.error('Error loading menu:', error);
    }
};

const createEventCard = (event) => {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const imagePath = getImagePath('eventos', null, event.id);
    
    card.innerHTML = `
        <img src="${imagePath}" alt="${event.nombre}" loading="lazy" decoding="async" onerror="this.src='./placeholder.jpg'">
        <div class="event-content">
            <h4 class="event-title">${event.nombre}</h4>
            <p class="event-description">${event.descripcion}</p>
        </div>
    `;
    
    return card;
};

const loadEvents = async () => {
    try {
        const timestamp = Date.now();
        const response = await fetch(`./data/eventos.json?v=${timestamp}`);
        const eventos = await response.json();
        
        const torneosContainer = document.getElementById('torneos-container');
        torneosContainer.innerHTML = '';
        if (eventos.torneos && eventos.torneos.length > 0) {
            eventos.torneos.forEach(torneo => {
                torneosContainer.appendChild(createEventCard(torneo));
            });
        }
        
        const fechasContainer = document.getElementById('fechas-container');
        fechasContainer.innerHTML = '';
        if (eventos.fechas_especiales && eventos.fechas_especiales.length > 0) {
            eventos.fechas_especiales.forEach(fecha => {
                fechasContainer.appendChild(createEventCard(fecha));
            });
        }
        
        const publicacionesSection = document.getElementById('publicaciones-section');
        const publicacionesContainer = document.getElementById('publicaciones-container');
        publicacionesContainer.innerHTML = '';
        if (eventos.publicaciones && eventos.publicaciones.length > 0) {
            publicacionesSection.style.display = 'block';
            eventos.publicaciones.forEach(pub => {
                publicacionesContainer.appendChild(createEventCard(pub));
            });
        } else {
            publicacionesSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
};

const initMap = () => {
    const map = L.map('map').setView([43.6108, 3.8767], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([43.6108, 3.8767]).addTo(map)
        .bindPopup('<b>Billiards Montpellier</b><br>Tu lugar de billar favorito')
        .openPopup();
};

const handleContactForm = async (e) => {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById('form-message');
    
    const nombre = formData.get('nombre');
    const email = formData.get('email');
    const telefono = formData.get('telefono');
    
    if (!nombre || !email || !telefono) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Por favor completa todos los campos obligatorios.';
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Por favor ingresa un correo electrónico válido.';
        return;
    }
    
    try {
        const response = await fetch('/server/contact.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageDiv.className = 'form-message success';
            messageDiv.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
            form.reset();
        } else {
            messageDiv.className = 'form-message error';
            messageDiv.textContent = result.message || 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.';
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Error de conexión. Por favor intenta nuevamente más tarde.';
        console.error('Form submission error:', error);
    }
};

const initNavigation = () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                navMenu.classList.remove('active');
            }
        });
    });
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            filterGallery(category);
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    loadGallery();
    loadMenu();
    loadEvents();
    initMap();
    initNavigation();
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
});
