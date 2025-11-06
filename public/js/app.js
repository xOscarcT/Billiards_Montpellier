const normalizeId = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
};

// Simple HTML escaper to prevent injection when inserting data from JSON
const escapeHTML = (str) => {
    return String(str || '').replace(/[&<>"']/g, (s) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[s];
    });
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

const formatPrice = (p) => {
    if (typeof p === 'number') return `$${p.toFixed(2)}`;
    return String(p || '');
};

const createPlayerCard = (player) => {
    // Wrapper kept for grid layout
    const card = document.createElement('div');
    card.className = 'player-card';

    const imagePath = getImagePath('jugadores', null, player.id);

    // Inner card (design provided)
    const box = document.createElement('div');
    box.className = 'card_box';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', `${player.nombre} - ${player.texto}`);

    // Badge span: use data-badge so ::before can show it via CSS
    const badgeSpan = document.createElement('span');
    badgeSpan.setAttribute('data-badge', `#${player.puesto}`);
    // add a class so CSS can color badges by puesto
    let badgeClass = 'badge-default';
    if (player.puesto === 1) badgeClass = 'badge-1';
    else if (player.puesto === 2) badgeClass = 'badge-2';
    else if (player.puesto === 3) badgeClass = 'badge-3';
    else if (player.puesto === '') badgeClass = 'badge-none';
    badgeSpan.className = badgeClass;

    // Bottom name area (name + texto). Use escaped content to avoid injection.
    const nameBox = document.createElement('div');
    nameBox.className = 'player-name-box';
    nameBox.innerHTML = `
        <small class="player-text-small">${escapeHTML(player.texto || '')}</small>
        <div class="player-name">${escapeHTML(player.nombre)}</div>
    `;

    // Check image exists then set as background-image; otherwise placeholder
    imageExists(imagePath, (exists) => {
        const chosen = exists ? imagePath : './img/placeholder.jpg';
        // set as background-image on box
        box.style.backgroundImage = `url('${chosen}')`;
    });

    box.appendChild(badgeSpan);
    box.appendChild(nameBox);
    card.appendChild(box);

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
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';

    const timestamp = Date.now();
    try {
        const response = await fetch(`./data/galeria.json?v=${timestamp}`);
        if (!response.ok) throw new Error('Galería JSON no disponible');
        const gallery = await response.json();

        Object.entries(gallery).forEach(([category, files]) => {
            if (!Array.isArray(files)) return;
            files.forEach(file => {
                const path = `./img/galeria/${category}/${file}`;
                imageExists(path, (exists) => {
                    if (exists) {
                        const item = document.createElement('div');
                        item.className = 'gallery-item';
                        item.dataset.category = category;

                        const img = document.createElement('img');
                        img.alt = `${category} - ${file}`;
                        img.loading = 'lazy';
                        img.decoding = 'async';
                        img.src = path;

                        item.appendChild(img);
                        container.appendChild(item);
                    }
                });
            });
        });
    } catch (error) {
        console.log('No se pudo cargar public/data/galeria.json. Usando fallback.', error);
        // Fallback: use the filesystem fallback already implemented
        loadGalleryFromFileSystem();
    }
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
            img.alt = `${category} - ${file}`;
            img.loading = 'lazy';
            img.decoding = 'async';

            const path = `./img/galeria/${category}/${file}`;
            imageExists(path, (exists) => {
                if (exists) {
                    img.src = path;
                    item.appendChild(img);
                    container.appendChild(item);
                }
                // if it doesn't exist, simply skip adding this image
            });
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

    const img = document.createElement('img');
    img.alt = `${item.nombre} - ${category}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    imageExists(imagePath, (exists) => {
        img.src = exists ? imagePath : './img/placeholder.jpg';
    });

    const nameDiv = document.createElement('div');
    nameDiv.className = 'menu-item-name';
    nameDiv.textContent = item.nombre;

    // If item has precio, add a price-tag and give the item a has-price class
    if (item.precio !== undefined && item.precio !== null && item.precio !== '') {
        const priceTag = document.createElement('div');
        priceTag.className = 'price-tag';
        const precioNum = Number(String(item.precio).replace(/[^0-9.-]/g, ''));
        if (!Number.isFinite(precioNum)) {
            priceTag.textContent = String(item.precio);
        } else {
            priceTag.textContent = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precioNum);
        }
        menuItem.classList.add('has-price');
        // add price tag before name so it's visible on top/center
        menuItem.appendChild(priceTag);
    }

    menuItem.appendChild(img);
    menuItem.appendChild(nameDiv);

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

    const img = document.createElement('img');
    img.alt = `${event.nombre} - ${event.descripcion}`;
    img.loading = 'lazy';
    img.decoding = 'async';

    imageExists(imagePath, (exists) => {
        img.src = exists ? imagePath : './img/placeholder.jpg';
    });

    const content = document.createElement('div');
    content.className = 'event-content';

    const title = document.createElement('h4');
    title.className = 'event-title';
    title.textContent = event.nombre;

    const desc = document.createElement('p');
    desc.className = 'event-description';
    desc.textContent = event.descripcion;

    content.appendChild(title);
    content.appendChild(desc);

    card.appendChild(img);
    card.appendChild(content);

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
    const map = L.map('map').setView([4.666294, -74.126159], 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([4.666294, -74.126159]).addTo(map)
        .bindPopup('<b>Billiards Montpellier</b><br>Cra. 82 #22f 45<br><a href="https://maps.app.goo.gl/3KtnuDFH1WYkxrBW9" target="_blank" rel="noopener">Ver en Google Maps</a>')
        .openPopup();
};

const handleContactForm = async (e) => {
    e.preventDefault();

    const form = e.target;
    const rawFormData = new FormData(form);
    const messageDiv = document.getElementById('form-message');

    // Simple sanitizer and limits
    const sanitize = (v, max = 500) => String(v || '').trim().slice(0, max);

    const nombre = sanitize(rawFormData.get('nombre'));
    const email = sanitize(rawFormData.get('email'));
    const telefono = sanitize(rawFormData.get('telefono'));
    const comentarios = sanitize(rawFormData.get('comentarios'), 2000);

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

    // Build a sanitized FormData to send
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('email', email);
    formData.append('telefono', telefono);
    formData.append('comentarios', comentarios);

    // disable submit button while sending
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';
    }

    try {
        const response = await fetch('/server/contact.php', {
            method: 'POST',
            body: formData
        });

        let result = null;

        if (response.ok) {
            try {
                result = await response.json();
            } catch (parseError) {
                // If server returned non-JSON but 200, handle gracefully
                messageDiv.className = 'form-message error';
                messageDiv.textContent = 'Respuesta inesperada del servidor. Por favor intenta nuevamente más tarde.';
                console.error('JSON parse error:', parseError);
                return;
            }

            if (result && result.success) {
                messageDiv.className = 'form-message success';
                messageDiv.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
                form.reset();
            } else {
                messageDiv.className = 'form-message error';
                // server message is shown as textContent to avoid XSS
                messageDiv.textContent = (result && result.message) ? result.message : 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente.';
            }
        } else {
            // non-OK status: try to extract error message
            let errText = 'Error del servidor. Por favor intenta nuevamente más tarde.';
            try {
                const errJson = await response.json();
                if (errJson && errJson.message) errText = errJson.message;
            } catch (jsonErr) {
                try {
                    const txt = await response.text();
                    if (txt) errText = txt.slice(0, 1000);
                } catch (tErr) {
                    // ignore
                }
            }

            messageDiv.className = 'form-message error';
            messageDiv.textContent = errText;
        }
    } catch (error) {
        messageDiv.className = 'form-message error';
        messageDiv.textContent = 'Error de conexión. Por favor intenta nuevamente más tarde.';
        console.error('Form submission error:', error);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.originalText || 'Enviar';
        }
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
