# Plan de campaña — Driza SHANG INVERSIONES

> Elaborado por el agente `estratega-campanas`. Presupuesto y zona confirmados por el usuario el 2026-07-14.
> **Nada de esto se crea en Meta hasta la confirmación final del usuario; todo nace en PAUSED.**

## Datos confirmados
- **Cliente objetivo:** mayoristas y revendedores (B2B). Usuario final = audiencia secundaria (fase posterior).
- **Presupuesto:** S/ 15.00 diarios (total, CBO).
- **Zona:** Iquitos, Nauta y Requena (Loreto, Perú).
- **Precios:** S/ 19.50/kg (1/4"–3/4") · S/ 21.00/kg (1/8", 5/32", 3/16").

## Lectura estratégica de la zona
Iquitos–Nauta–Requena es economía de río: pesca artesanal, carga fluvial y mercados (Belén, Modelo, puertos). La driza es consumible de trabajo diario ahí. Los compradores B2B son ferreterías, tiendas de pesca/náuticas, comerciantes de mercado y distribuidores que surten a los pueblos ribereños.

## Estructura (ajustada al presupuesto de S/ 15/día)
Con S/ 15/día la regla es **concentrar, no fragmentar**: UNA campaña, UN conjunto, y los ángulos compiten a nivel de anuncio.

### Campaña: `SHANG-B2B-WhatsApp-Loreto`
- **Objetivo:** OUTCOME_ENGAGEMENT
- **Presupuesto:** CBO S/ 15.00 diarios (1500 centavos PEN)
- **Estado al crear:** PAUSED

### Conjunto: `B2B-Loreto-Amplio`
- **Optimización:** CONVERSATIONS · **Destino:** WHATSAPP (requiere WhatsApp Business vinculado a la página de Facebook)
- **Geografía:** Iquitos, Nauta y Requena (ciudades + radio; verificar disponibilidad de cada ciudad en el buscador de geolocalización de Meta; si Nauta o Requena no existen como ciudad, usar pin con radio).
- **Audiencia:** amplia (Advantage+), edad 22–65. SIN intereses inventados: con S/ 15/día y 3 ciudades, la audiencia es pequeña; segmentar más la ahogaría. El filtro B2B lo hace el CREATIVO (el copy habla de márgenes, listas de precios y reposición — el pescador no responde a eso).
- **Ubicaciones:** automáticas (Advantage+).
- **Estado al crear:** PAUSED

### Anuncios (4, todos PAUSED) — los ángulos B2B compiten entre sí
| # | Nombre | Ángulo | Formato | Fuente |
|---|---|---|---|---|
| 1 | `Revendedor-A4-Flyer-2026-07` | 4 (reclamos) | Imagen 4:5 | `flyers/flyer-revendedor-angulo4.html` exportado a PNG |
| 2 | `Mayorista-A5-Flyer-2026-07` | 5 (rotación) | Imagen 4:5 | `flyers/flyer-mayorista-angulo5.html` exportado a PNG |
| 3 | `Revendedor-A4-Video-2026-07` | 4 | Video 9:16 | Guion "El mostrador" (cuando esté grabado) |
| 4 | `Mayorista-A5-Video-2026-07` | 5 | Video 9:16 | Guion "La bodega" (cuando esté grabado) |

**Fase 1 (semanas 1–2):** lanzar con los 2 flyers (anuncios 1 y 2) — no dependen de grabación.
**Fase 2:** sumar los videos 4 y 5 apenas estén grabados; Meta redistribuye el presupuesto al mejor.

## Copys asignados
- Anuncio 1: Copy 4A (texto) + titular "Vende cuerda que no vuelve reclamada" + CTA WHATSAPP_MESSAGE
- Anuncio 2: Copy 5A (texto) + titular "Stock que rota, no que estorba" + CTA WHATSAPP_MESSAGE
(Textos exactos en `marketing/copys/copys-meta-ads.md`.)

## KPIs y reglas de decisión
- **KPI principal:** costo por conversación iniciada en WhatsApp. Con S/ 15/día, esperar S/ 1.50–5.00 por conversación en zona de baja competencia publicitaria como Loreto.
- **Ventana de decisión:** mínimo 7 días o ~20 conversaciones antes de apagar un anuncio (el presupuesto bajo exige paciencia estadística).
- **KPI de negocio:** nº de listas de precios enviadas y pedidos mayoristas cerrados por semana (registrar manualmente en WhatsApp).
- **Escalado:** si una semana cierra ≥1 pedido mayorista, el retorno paga la campaña completa (un solo pedido de 50 kg ≈ S/ 975 ≫ S/ 105/semana de pauta). Subir presupuesto gradualmente (máx. +20 % cada 3 días).

## Requisitos previos para materializar (checklist del gestor)
- [ ] Número de WhatsApp Business **vinculado a la página de Facebook** de SHANG
- [ ] Página de Facebook identificada (`ads_get_ad_account_pages`)
- [ ] Cuenta publicitaria activa con método de pago (`ads_get_ad_accounts`)
- [ ] Flyers exportados a PNG 1080×1350 y subidos
- [ ] Confirmación final del usuario del presupuesto S/ 15/día → recién entonces crear (en PAUSED)
- [ ] Activación: solo con orden explícita del usuario, entidad por entidad

## Fuera de alcance por ahora (fase 3, opcional)
- Campaña B2C de demanda (ángulos 1–3) para que los pescadores pidan la marca en las ferreterías: recomendable solo si se sube el presupuesto total a ≥ S/ 30/día, para no quitarle fuego a la campaña B2B.
