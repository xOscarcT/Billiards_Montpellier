# Billiards Montpellier - Sitio Web Multilanding

## Resumen del Proyecto
Sitio web multilanding para "Billiards Montpellier", un establecimiento de billar con tradición desde 1998. El sitio está desarrollado con HTML, CSS y JavaScript puro (sin frameworks), con un diseño minimalista y elegante en colores negro y blanco con acentos en rojo y amarillo.

## Estructura del Proyecto

```
/
├── index.html              # Página principal con todas las secciones
├── styles.css              # Estilos minimalistas y responsive
├── app.js                  # JavaScript para contenido dinámico
├── public/
│   ├── data/              # Archivos JSON con contenido dinámico
│   │   ├── jugadores.json  # Datos de jugadores destacados
│   │   ├── menu.json       # Catálogo de productos
│   │   └── eventos.json    # Eventos y noticias
│   ├── img/               # Imágenes del sitio
│   │   ├── jugadores/     # Fotos de jugadores destacados
│   │   ├── menu/          # Imágenes de productos (bebidas, comidas, etc.)
│   │   ├── eventos/       # Imágenes de eventos
│   │   ├── galeria/       # Galería de fotos (instalaciones, barra, mesas, torneos)
│   │   └── hero-banner.jpg
│   └── placeholder.jpg     # Imagen fallback
└── server/
    └── contact.php        # Backend para formulario de contacto
```

## Características Principales

### 1. Página de Inicio
- Banner hero con imagen de fondo y overlay semitransparente
- Sección de jugadores destacados con sistema de medallas (oro/plata/bronce para top 3)
- Historia del establecimiento
- Horarios de atención

### 2. Galería
- Diseño tipo masonry/Pinterest responsive
- Filtros por categoría (Instalaciones, Barra, Mesas, Torneos)
- Lazy loading de imágenes
- Soporte para imágenes de diferentes tamaños

### 3. Menú
- Catálogo de productos organizado por categorías:
  - Bebidas
  - Comidas
  - Licores
  - Snacks
  - Promociones
- Muestra foto y nombre (sin precios)
- Carga dinámica desde JSON

### 4. Eventos y Noticias
- Subsecciones para:
  - Torneos
  - Fechas especiales
  - Publicaciones (opcional)
- Tarjetas con foto, título y descripción

### 5. Contacto
- Mapa interactivo de OpenStreetMap (Leaflet.js)
- Formulario de contacto con validación frontend
- Backend PHP para procesamiento
- Botones rápidos para redes sociales

### 6. Características Generales
- Diseño responsive (desktop, tablet, móvil)
- Navegación suave entre secciones
- Botón flotante de WhatsApp con efecto "breathing backlight"
- Animaciones suaves en hover y scroll
- Accesibilidad (atributos alt, focus states)

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 8.2
- **Mapas**: Leaflet.js con OpenStreetMap
- **Servidor**: PHP built-in server

## Sistema de Contenido Dinámico

### Normalización de IDs
Los IDs de los elementos se normalizan para crear rutas de archivo consistentes:
- Conversión a minúsculas
- Reemplazo de espacios por guiones bajos
- Eliminación de tildes y caracteres especiales

### Rutas de Imágenes
```javascript
Jugadores: /public/img/jugadores/{id}.jpg
Menú:      /public/img/menu/{categoria}/{id}.jpg
Eventos:   /public/img/eventos/{id}.jpg
Galería:   /public/img/galeria/{categoria}/{archivo}.jpg
```

### Cache Busting
Los archivos JSON se cargan con timestamps para evitar problemas de caché:
```javascript
fetch(`public/data/jugadores.json?v=${Date.now()}`)
```

## Configuración del Servidor

El proyecto utiliza el servidor de desarrollo de PHP en el puerto 5000:
```bash
php -S 0.0.0.0:5000
```

## Estilos y Diseño

### Paleta de Colores
- **Negro**: #000000 (fondos principales)
- **Blanco**: #ffffff (texto y fondos alternos)
- **Rojo**: #e63946 (acentos y hover)
- **Amarillo**: #ffd60a (acentos secundarios)
- **Grises**: #1a1a1a, #333333, #f5f5f5

### Animaciones
- Transiciones suaves: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Fade in up para secciones
- Scale effect en hero title
- Breathing glow para botón WhatsApp flotante

## Cómo Actualizar Contenido

### Agregar un Jugador
1. Añadir imagen en `/public/img/jugadores/{id}.jpg`
2. Actualizar `/public/data/jugadores.json`:
```json
{
  "id": "nombre_apellido",
  "nombre": "Nombre Apellido",
  "texto": "Descripción del jugador",
  "puesto": 1
}
```

### Agregar Producto al Menú
1. Añadir imagen en `/public/img/menu/{categoria}/{id}.jpg`
2. Actualizar `/public/data/menu.json` en la categoría correspondiente

### Agregar Evento
1. Añadir imagen en `/public/img/eventos/{id}.jpg`
2. Actualizar `/public/data/eventos.json` en la subsección correspondiente

### Agregar Fotos a la Galería
Simplemente agregar imágenes en las carpetas correspondientes:
- `/public/img/galeria/instalaciones/`
- `/public/img/galeria/barra/`
- `/public/img/galeria/mesas/`
- `/public/img/galeria/torneos/`

## Accesibilidad

- Todas las imágenes tienen atributos `alt`
- Botones y enlaces tienen estados de focus visibles
- Navegación funciona con teclado
- Diseño responsive para diferentes tamaños de pantalla
- Lazy loading para optimizar rendimiento

## Cambios Recientes

**2024-11-05**
- Creación inicial del proyecto
- Implementación de todas las secciones principales
- Generación de imágenes de stock
- Configuración del servidor PHP
- Sistema de carga dinámica de contenido
- Integración de mapa OpenStreetMap
- Formulario de contacto funcional

## Configuración SMTP (Envío de Emails)

El formulario de contacto utiliza **PHPMailer** para enviar correos electrónicos. Para habilitar el envío:

1. Ve a la pestaña "Secrets" en Replit
2. Agrega las siguientes variables de entorno:
   - `SMTP_USER`: Tu email SMTP (ej: tucuenta@gmail.com)
   - `SMTP_PASS`: Tu contraseña de aplicación SMTP
   - `SMTP_HOST` (opcional): Servidor SMTP (default: smtp.gmail.com)
   - `SMTP_PORT` (opcional): Puerto SMTP (default: 587)
   - `CONTACT_EMAIL` (opcional): Email destino (default: info@billiardsmontpellier.com)

**Nota**: Sin configuración SMTP, el formulario seguirá funcionando y registrará mensajes en `server/contact_log.txt`, pero no enviará emails reales. Consulta `server/SMTP_CONFIG.md` para detalles completos de configuración.

## Notas Técnicas

- El sitio no utiliza frameworks (vanilla JavaScript)
- Las imágenes se cargan con `loading="lazy"` y `decoding="async"`
- El formulario de contacto guarda logs en `/server/contact_log.txt`
- Si una categoría está vacía en el menú, se oculta automáticamente
- El placeholder se muestra si una imagen no existe
- PHPMailer v7.0.0 instalado vía Composer
- PHP 8.2.23 como servidor de desarrollo

## Próximas Mejoras Sugeridas

- Panel de administración para gestionar contenido JSON
- Funcionalidad de carga de imágenes
- Soporte multi-idioma
- Integración con PHPMailer real para envío de correos
- Sistema de newsletter
