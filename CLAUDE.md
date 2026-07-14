# Equipo de agentes de marketing — Driza SHANG INVERSIONES

Este repositorio contiene un equipo de 6 agentes de marketing (en `.claude/agents/`) y el material estratégico (en `marketing/`) para vender la driza SHANG INVERSIONES (cuerda 100% P.P. en rollos de 1, 5 y 10 kg) a pescadores, revendedores (ferreterías) y mayoristas mediante Meta Ads.

## Pipeline de trabajo (orden obligatorio)
1. **copywriter-marketing** → escribe copys basados en `marketing/angulos-de-dolor.md` → `marketing/copys/`
2. **director-creativo** → convierte copys en guiones de video y flyers → `marketing/creativos/`
3. **estratega-campanas** → diseña estructura, presupuesto y audiencias → `marketing/plan-de-campana.md`
4. **verificador-anuncios** → audita políticas, specs y coherencia → `marketing/analisis/informe-verificacion.md`
5. **aprobador-predictor** → puntúa 0–100 la probabilidad de éxito y emite veredicto → `marketing/analisis/informe-aprobacion.md`
6. **gestor-anuncios-meta** → materializa en Meta Ads (todo en PAUSED) → `marketing/registro-de-anuncios.md`

## Reglas globales (aplican a todos los agentes)
- Idioma: español latinoamericano, siempre.
- Todo copy/creativo se ancla a UNO de los 5 ángulos de dolor y a UN segmento; se vende el dolor y la emoción, el beneficio es la resolución.
- NADA se activa en Meta sin confirmación explícita del usuario: campañas, conjuntos y anuncios nacen en PAUSED.
- No inventar especificaciones del producto ni IDs de intereses; lo comprobable vive en `marketing/brief-de-marca.md`.
- Presupuestos: siempre confirmados por el usuario antes de crear campañas.

## Conectores disponibles en la sesión
- **Meta Ads MCP** (`mcp__Meta_ads_MCP__*`): campañas, conjuntos, creativos, anuncios, A/B tests, Ad Library, benchmarks.
- **Canva** (`mcp__Canva__*`): generación y exportación de diseños.
- **Shopify** y **Supermetrics**: tienda y analítica, si aplica.
