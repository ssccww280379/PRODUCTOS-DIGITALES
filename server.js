require('dotenv').config();
const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ---- Mercado Pago client ----
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

// ---- Catálogo de productos ----
const PRODUCTOS = {
  'metodo-pequeno-durmiente': {
    id: 'metodo-pequeno-durmiente',
    title: 'Método Pequeño Durmiente',
    description: 'El método de sueño respetuoso para enseñarle a tu hijo (1-5 años) a dormir solo y toda la noche.',
    unit_price: 67,
    downloads: ['DOWNLOAD_URL_EBOOK'],
    emailSubject: '¡Tu ebook Método Pequeño Durmiente ya está listo! 🌙',
  },
};

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
// El frontend llama a este endpoint cuando el cliente hace clic en "Comprar"
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
        items: [
          {
            id: producto.id,
            title: producto.title,
            description: producto.description,
            quantity: 1,
            unit_price: producto.unit_price,
            currency_id: 'PEN',
          },
        ],
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

    res.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (err) {
    console.error('Error creando preferencia MP:', err);
    res.status(500).json({ error: 'Error al crear el pago. Intenta de nuevo.' });
  }
});

// ---- POST /api/webhook ----
// Mercado Pago notifica aquí cuando hay un cambio de estado en el pago
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
      console.warn('Webhook: falta productId o email del comprador', { productId, emailComprador });
      return;
    }

    const producto = PRODUCTOS[productId];
    if (!producto) return;

    await enviarEbook(emailComprador, producto, pago);
    console.log(`✅ Ebook enviado a ${emailComprador} — ${producto.title}`);
  } catch (err) {
    console.error('Error procesando webhook:', err);
  }
});

// ---- Función para enviar el email con el ebook ----
async function enviarEbook(emailDestino, producto, pago) {
  const downloadLinks = producto.downloads
    .map((envKey, i) => {
      const url = process.env[envKey];
      const nombres = ['📘 Ebook principal', '📗 Ebook 2', '📙 Ebook 3', '🎁 Bonus especial'];
      return `<li style="margin-bottom:12px;"><strong>${nombres[i]}:</strong><br>
        <a href="${url}" style="color:#C17858;font-weight:600;">Descargar ahora →</a></li>`;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#333;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#C17858;font-size:28px;margin-bottom:8px;">Crianza con Amor</h1>
        <p style="color:#777;font-size:14px;">Tu guía de crianza respetuosa</p>
      </div>
      <h2 style="color:#2D2D2D;">¡Hola! Tu compra fue confirmada 🎉</h2>
      <p>Gracias por confiar en <strong>Crianza con Amor</strong>. A continuación encuentra los enlaces de descarga de tu(s) ebook(s):</p>
      <div style="background:#FDF8F5;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #E8D5C8;">
        <h3 style="color:#C17858;margin-bottom:16px;">📦 Tu pedido: ${producto.title}</h3>
        <ul style="list-style:none;padding:0;">
          ${downloadLinks}
        </ul>
      </div>
      <div style="background:#F0F9F5;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #C8DDD8;">
        <p style="margin:0;color:#4A7C6B;font-size:14px;">
          <strong>💡 Tip:</strong> Descarga el PDF a tu celular o tablet para tenerlo siempre disponible.
          Puedes abrirlo con cualquier app de PDF, incluso sin internet.
        </p>
      </div>
      <p>Si tienes alguna pregunta o necesitas ayuda, responde a este correo con gusto.</p>
      <p style="margin-top:32px;">Con amor,<br><strong>Ana Lucía</strong><br>
        <span style="color:#777;font-size:13px;">Crianza con Amor</span></p>
      <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
      <p style="font-size:11px;color:#aaa;text-align:center;">
        Número de pago: ${pago.id} · ${new Date().toLocaleDateString('es-PE')}
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
  console.log(`   Email: ${process.env.EMAIL_USER ? '✓ Configurado' : '✗ FALTA'}`);
});
