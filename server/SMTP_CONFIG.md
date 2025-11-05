# Configuración SMTP para Envío de Emails

El formulario de contacto utiliza PHPMailer para enviar correos electrónicos. Para habilitar el envío de emails, necesitas configurar las credenciales SMTP mediante variables de entorno.

## Variables de Entorno Requeridas

En Replit, ve a la pestaña "Secrets" y agrega las siguientes variables:

### Obligatorias
- `SMTP_USER`: Tu dirección de email SMTP (ej: `tucuenta@gmail.com`)
- `SMTP_PASS`: Tu contraseña o contraseña de aplicación SMTP

### Opcionales (con valores por defecto)
- `SMTP_HOST`: Servidor SMTP (por defecto: `smtp.gmail.com`)
- `SMTP_PORT`: Puerto SMTP (por defecto: `587`)
- `CONTACT_EMAIL`: Email de destino para los mensajes (por defecto: `info@billiardsmontpellier.com`)

## Configuración para Gmail

1. Ve a tu cuenta de Google
2. Habilita la verificación en dos pasos
3. Genera una "Contraseña de aplicación" en: https://myaccount.google.com/apppasswords
4. Usa esta contraseña en `SMTP_PASS`

Ejemplo de configuración:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucuenta@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx (contraseña de aplicación de 16 dígitos)
CONTACT_EMAIL=destinatario@ejemplo.com
```

## Configuración para Otros Proveedores

### Outlook/Hotmail
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tucuenta@outlook.com
SMTP_PASS=tu_contraseña
```

### Yahoo
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=tucuenta@yahoo.com
SMTP_PASS=tu_contraseña
```

### Servidor SMTP Personalizado
```
SMTP_HOST=smtp.tuservidor.com
SMTP_PORT=587 (o 465 para SSL)
SMTP_USER=tu_usuario
SMTP_PASS=tu_contraseña
```

## Comportamiento sin Configuración SMTP

Si las variables `SMTP_USER` y `SMTP_PASS` no están configuradas:
- El formulario seguirá funcionando
- Los mensajes se registrarán en `server/contact_log.txt`
- El usuario recibirá un mensaje indicando que la configuración SMTP es necesaria
- No se enviarán emails reales

## Verificación

Para verificar que el envío de emails funciona:
1. Configura las variables de entorno
2. Envía un mensaje de prueba desde el formulario
3. Verifica el archivo `server/contact_log.txt` para ver el resultado
4. Revisa la bandeja de entrada del email configurado en `CONTACT_EMAIL`

## Seguridad

- Nunca compartas tus credenciales SMTP
- Usa contraseñas de aplicación específicas cuando sea posible
- Las credenciales se almacenan de forma segura en las variables de entorno de Replit
- El código no expone las credenciales en los logs ni respuestas
