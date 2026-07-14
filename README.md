# 🎣 Sistema de agentes de marketing — Línea trenzada de marca propia

Equipo de 6 agentes de IA (Claude Code) que producen y gestionan la publicidad en Meta Ads para una línea de pesca trenzada, dirigida a **pescadores, revendedores y mayoristas**, vendiendo siempre **el dolor y la emoción detrás del beneficio**.

## Los agentes (`.claude/agents/`)
| # | Agente | Qué hace |
|---|---|---|
| 1 | `copywriter-marketing` | Escribe los copys (textos, titulares, CTAs) sobre los 5 ángulos de dolor |
| 2 | `director-creativo` | Crea guiones de video (Reels) y flyers HTML; puede usar Canva |
| 3 | `estratega-campanas` | Diseña la campaña: objetivos, presupuesto, audiencias, plan de testeo |
| 4 | `gestor-anuncios-meta` | Crea los anuncios en Meta Ads (siempre en pausa) vía el conector Meta Ads |
| 5 | `verificador-anuncios` | Audita políticas de Meta, specs técnicas y coherencia antes de publicar |
| 6 | `aprobador-predictor` | Puntúa 0–100 la probabilidad de éxito y da el veredicto final |

## Cómo usarlos
Desde Claude Code, en este repositorio, pide por ejemplo:
- «Usa el agente **copywriter-marketing** para escribir 3 copys nuevos del ángulo 2»
- «Que el **director-creativo** haga un flyer para el ángulo 3»
- «**estratega-campanas**: arma el plan para $X/día en [país]»
- «**verificador-anuncios** y luego **aprobador-predictor**: revisen todo lo pendiente»
- «**gestor-anuncios-meta**: sube los anuncios aprobados (en pausa)»

O simplemente: «Corre el pipeline completo para el ángulo 1» — Claude orquesta los agentes en orden (ver `CLAUDE.md`).

## Material incluido (`marketing/`)
- `brief-de-marca.md` — **⚠️ complétalo primero** (nombre de marca, logo, precios, WhatsApp…)
- `angulos-de-dolor.md` — los 5 ángulos de dolor con su emoción y beneficio
- `copys/copys-meta-ads.md` — 10 copys listos (2 por ángulo + titulares extra)
- `creativos/guiones-video.md` — 5 guiones de Reels (15–30 s) con shot list
- `creativos/flyers/` — 3 flyers HTML (1080×1350) listos para exportar como imagen
- `analisis/video-vs-flyer.md` — recomendación: cuándo usar video y cuándo flyer

## Seguridad
- Ningún anuncio se activa ni gasta dinero sin tu confirmación explícita: todo se crea **en pausa**.
- Los agentes no inventan especificaciones del producto: solo usan lo declarado en el brief.
