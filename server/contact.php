<?php
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$telefono = isset($_POST['telefono']) ? trim($_POST['telefono']) : '';
$comentarios = isset($_POST['comentarios']) ? trim($_POST['comentarios']) : '';

if (empty($nombre) || empty($email) || empty($telefono)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos obligatorios deben estar completos.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El correo electrónico no es válido.']);
    exit;
}

$log_file = __DIR__ . '/contact_log.txt';
$log_entry = date('Y-m-d H:i:s') . " - Mensaje recibido de: $nombre ($email)\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

$mail = new PHPMailer(true);

try {
    $smtpHost = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
    $smtpPort = getenv('SMTP_PORT') ?: 587;
    $smtpUser = getenv('SMTP_USER') ?: '';
    $smtpPass = getenv('SMTP_PASS') ?: '';
    $mailTo = getenv('CONTACT_EMAIL') ?: 'info@billiardsmontpellier.com';
    
    if (empty($smtpUser) || empty($smtpPass)) {
        file_put_contents($log_file, date('Y-m-d H:i:s') . " - ADVERTENCIA: SMTP no configurado. Configure SMTP_USER y SMTP_PASS en variables de entorno.\n", FILE_APPEND);
        
        echo json_encode([
            'success' => true,
            'message' => 'Mensaje recibido y registrado. (Nota: El envío de email requiere configuración SMTP)',
            'data' => [
                'nombre' => $nombre,
                'email' => $email,
                'telefono' => $telefono
            ]
        ]);
        exit;
    }
    
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $smtpPort;
    $mail->CharSet = 'UTF-8';
    
    $mail->setFrom($smtpUser, 'Billiards Montpellier - Contacto');
    $mail->addAddress($mailTo);
    $mail->addReplyTo($email, $nombre);
    
    $mail->isHTML(true);
    $mail->Subject = 'Nuevo mensaje de contacto - Billiards Montpellier';
    
    $htmlMessage = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { background-color: #f5f5f5; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #e63946; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Nuevo Mensaje de Contacto</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Nombre:</span> " . htmlspecialchars($nombre) . "
                </div>
                <div class='field'>
                    <span class='label'>Email:</span> " . htmlspecialchars($email) . "
                </div>
                <div class='field'>
                    <span class='label'>Teléfono:</span> " . htmlspecialchars($telefono) . "
                </div>
                <div class='field'>
                    <span class='label'>Comentarios:</span><br>
                    " . nl2br(htmlspecialchars($comentarios)) . "
                </div>
            </div>
            <div class='footer'>
                <p>Enviado desde el formulario de contacto de Billiards Montpellier</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $mail->Body = $htmlMessage;
    $mail->AltBody = "Nuevo mensaje de contacto recibido:\n\n" .
                     "Nombre: " . htmlspecialchars($nombre) . "\n" .
                     "Email: " . htmlspecialchars($email) . "\n" .
                     "Teléfono: " . htmlspecialchars($telefono) . "\n" .
                     "Comentarios: " . htmlspecialchars($comentarios) . "\n\n" .
                     "Enviado desde el formulario de contacto de Billiards Montpellier";
    
    $mail->send();
    
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Email enviado exitosamente a $mailTo\n", FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado con éxito! Te contactaremos pronto.',
        'data' => [
            'nombre' => $nombre,
            'email' => $email,
            'telefono' => $telefono
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    
    file_put_contents($log_file, date('Y-m-d H:i:s') . " - Error al enviar email: {$mail->ErrorInfo}\n", FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'message' => 'Hubo un error al enviar el mensaje. Por favor intenta nuevamente o contáctanos directamente.',
        'error' => 'Error técnico al procesar el envío'
    ]);
}
?>
