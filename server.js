require('dotenv').config();
const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Archivos estáticos públicos (HTML, CSS, JS) — pero NO la carpeta /ebooks
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  // Bloquear acceso directo a la carpeta de ebooks
  setHeaders: (res, filePath) => {
    if (filePath.includes('/ebooks/')) {
      res.status(403).end();
    }
  }
}));

// ---- Mercado Pago client ----
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ---- Catálogo de productos ----
// archivo: ruta relativa desde la raíz del proyecto, dentro de /ebooks/
const PRODUCTOS = {
  'metodo-pequeno-durmiente': {
    id: 'metodo-pequeno-durmiente',
    title: 'Método Pequeño Durmiente',
    description: 'El método de sueño respetuoso para enseñarle a tu hijo (1-5 años) a dormir solo y toda la noche.',
    unit_price: 67,
    archivo: 'ebooks/metodo-pequeno-durmiente.pdf',
    nombreArchivo: 'Metodo-Pequeno-Durmiente.pdf',
    emailSubject: '¡Tu ebook Método Pequeño Durmiente ya está listo! 🌙',
  },
};

// ---- Tokens de descarga en memoria ----
// Estructura: { [token]: { productId, email, expira, usado } }
const tokensDescarga = new Map();

function crearToken(productId, email) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = Date.now() + 48 * 60 * 60 * 1000; // 48 horas
  tokensDescarga.set(token, { productId, email, expira, usado: false });
  return token;
}

// ---- Email transporter ----
const mailer = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---- POST /api/crear-preferencia ----
app.post('/api/crear-preferencia', async (req, res) => {
  const { productId, payerEmail } = req.body;

  const producto = PRODUCTOS[productId];
  if (!producto) {
    return res.status(400).json({ error: 'Producto no encontrado' });
  }

  try {
    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [{
          id: producto.id,
          title: producto.title,
          description: producto.description,
          quantity: 1,
          unit_price: producto.unit_price,
          currency_id: 'PEN',
        }],
        payer: payerEmail ? { email: payerEmail } : undefined,
        back_urls: {
          success: `${process.env.BASE_URL}/exito.html`,
          failure: `${process.env.BASE_URL}/cancelado.html`,
          pending: `${process.env.BASE_URL}/pendiente.html`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BASE_URL}/api/webhook`,
        statement_descriptor: 'Crianza con Amor',
        metadata: { product_id: productId },
      },
    });

    res.json({ preferenceId: result.id, initPoint: result.init_point });
  } catch (err) {
    console.error('Error creando preferencia MP:', err);
    res.status(500).json({ error: 'Error al crear el pago. Intenta de nuevo.' });
  }
});

// ---- POST /api/webhook ----
app.post('/api/webhook', async (req, res) => {
  res.sendStatus(200); // Responde rápido para que MP no reintente

  const { type, data } = req.body;
  if (type !== 'payment' || !data?.id) return;

  try {
    const paymentApi = new Payment(mpClient);
    const pago = await paymentApi.get({ id: data.id });

    if (pago.status !== 'approved') return;

    const productId = pago.metadata?.product_id || pago.additional_info?.items?.[0]?.id;
    const emailComprador = pago.payer?.email;

    if (!productId || !emailComprador) {
      console.warn('Webhook: falta productId o email', { productId, emailComprador });
      return;
    }

    const producto = PRODUCTOS[productId];
    if (!producto) return;

    // Crear token único de descarga
    const token = crearToken(productId, emailComprador);
    await enviarEmail(emailComprador, producto, pago, token);
    console.log(`✅ Email enviado a ${emailComprador} | token: ${token.slice(0, 8)}...`);
  } catch (err) {
    console.error('Error en webhook:', err);
  }
});

// ---- GET /descargar?token=XXXX ----
// El comprador hace clic en el link del email y descarga el PDF aquí
app.get('/descargar', (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).send('Link de descarga inválido.');

  const datos = tokensDescarga.get(token);

  if (!datos) return res.status(404).send('Link no encontrado. Revisa tu correo o contáctanos.');
  if (datos.usado) return res.status(410).send('Este link ya fue usado. Solo se puede descargar una vez. Si necesitas descargarlo de nuevo, escríbenos.');
  if (Date.now() > datos.expira) return res.status(410).send('Este link expiró (válido 48 horas). Escríbenos para recibir uno nuevo.');

  const producto = PRODUCTOS[datos.productId];
  if (!producto) return res.status(404).send('Producto no encontrado.');

  const rutaArchivo = path.join(__dirname, producto.archivo);
  if (!fs.existsSync(rutaArchivo)) {
    console.error('Archivo no encontrado en disco:', rutaArchivo);
    return res.status(500).send('Error interno. Por favor contáctanos.');
  }

  // Marcar como usado ANTES de enviar (evita descarga doble en click rápido)
  datos.usado = true;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${producto.nombreArchivo}"`);
  fs.createReadStream(rutaArchivo).pipe(res);
});

// ---- Función para enviar el email ----
async function enviarEmail(emailDestino, producto, pago, token) {
  const linkDescarga = `${process.env.BASE_URL}/descargar?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#333;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#C17858;font-size:28px;margin-bottom:8px;">Crianza con Amor</h1>
        <p style="color:#777;font-size:14px;">Tu guía de crianza respetuosa</p>
      </div>

      <h2 style="color:#2D2D2D;">¡Hola! Tu compra fue confirmada 🎉</h2>
      <p>Gracias por confiar en <strong>Crianza con Amor</strong>. Tu ebook está listo para descargar:</p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${linkDescarga}"
           style="display:inline-block;background:#C17858;color:#fff;padding:18px 40px;border-radius:100px;font-weight:700;font-size:16px;text-decoration:none;">
          🌙 Descargar mi ebook ahora
        </a>
      </div>

      <div style="background:#FDF8F5;border-radius:12px;padding:20px 24px;margin:24px 0;border:1px solid #E8D5C8;">
        <p style="margin:0 0 8px;color:#C17858;font-weight:700;">📦 Tu pedido: ${producto.title}</p>
        <p style="margin:0;color:#777;font-size:13px;">
          ⏰ Este link es válido por <strong>48 horas</strong> y funciona <strong>una sola vez</strong>.<br>
          Guarda el PDF en tu celular o computadora en cuanto lo descargues.
        </p>
      </div>

      <div style="background:#F0F9F5;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #C8DDD8;">
        <p style="margin:0;color:#4A7C6B;font-size:14px;">
          <strong>💡 Tip:</strong> Ábrelo en tu celular con cualquier app de PDF
          (Adobe Reader, Google PDF Viewer, etc.) para tenerlo siempre a mano, incluso sin internet.
        </p>
      </div>

      <p>Si el botón no funciona, copia y pega este link en tu navegador:</p>
      <p style="word-break:break-all;color:#C17858;font-size:13px;">${linkDescarga}</p>

      <p>Si tienes alguna pregunta, responde este correo y te ayudo con gusto.</p>
      <p style="margin-top:32px;">Con amor,<br><strong>Ana Lucía</strong><br>
        <span style="color:#777;font-size:13px;">Crianza con Amor</span></p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
      <p style="font-size:11px;color:#aaa;text-align:center;">
        Pago N° ${pago.id} · ${new Date().toLocaleDateString('es-PE')}
      </p>
    </body>
    </html>
  `;

  await mailer.sendMail({
    from: process.env.EMAIL_FROM,
    to: emailDestino,
    subject: producto.emailSubject,
    html,
  });
}

// ---- Iniciar servidor ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   MP Access Token: ${process.env.MP_ACCESS_TOKEN ? '✓ Configurado' : '✗ FALTA'}`);
  console.log(`   Email:           ${process.env.EMAIL_USER ? '✓ Configurado' : '✗ FALTA'}`);

  // Verificar que el ebook existe en disco al arrancar
  for (const [id, p] of Object.entries(PRODUCTOS)) {
    const ruta = path.join(__dirname, p.archivo);
    const existe = fs.existsSync(ruta);
    console.log(`   Ebook [${id}]:    ${existe ? '✓ Encontrado' : '✗ FALTA — ponlo en: ' + ruta}`);
  }
});
