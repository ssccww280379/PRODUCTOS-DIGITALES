# CLAUDE.md

Este archivo le proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## Descripción del proyecto

Este repositorio es el espacio de trabajo de **Duerme toda la noche** (`duermetodalanoche.com`), una tienda Shopify con sede en Perú que vende productos digitales de entrenamiento de sueño para padres. No hay código fuente de aplicación — este repositorio sirve como base operativa para gestionar la tienda y su marketing a través de las herramientas MCP conectadas.

**Contexto de la tienda:**
- **Moneda:** PEN (Sol peruano, S/.)
- **Zona horaria:** UTC-5 (Lima, Perú)
- **Idioma:** Español (todo el contenido de productos, descripciones y texto dirigido al cliente debe estar en español)
- **Plan:** Shopify
- **Catálogo actual:** 1 producto digital — *Método pequeño durmiente* (guía de entrenamiento de sueño, S/. 37.00)

## Herramientas MCP conectadas

Dos servidores MCP están disponibles en cada sesión.

### Shopify (`mcp__f671a2e6-...`)

Gestiona la tienda directamente a través de la API de administración de Shopify.

| Capacidad | Herramienta(s) principal(es) |
|---|---|
| Detalles de la tienda | `get-shop-info` |
| Productos — lectura | `search_products`, `get-product` |
| Productos — escritura | `create-product`, `update-product`, `bulk-update-product-status` |
| Colecciones | `search_collections`, `get-collection`, `create-collection`, `update-collection`, `add-to-collection` |
| Pedidos | `list-orders`, `get-order` |
| Clientes | `list-customers` |
| Inventario | `get-inventory-levels`, `set-inventory` |
| Analítica | `run-analytics-query` (ShopifyQL) |
| Descuentos | `create-discount` |
| Todo lo demás | `graphql_query` / `graphql_mutation` (usar para metafields, páginas, blogs, tarjetas de regalo, mercados, etc.) |

**Regla de decisión GraphQL:** preferir una herramienta dedicada cuando exista; recurrir a `graphql_query` o `graphql_mutation` para todo lo demás. Nunca decirle al usuario que algo no está disponible solo porque no existe una herramienta dedicada.

Antes de escribir cualquier GraphQL, llamar a `graphql_schema` para inspeccionar los tipos disponibles y a `validate_graphql_codeblocks` para verificar la sintaxis antes de mutar.

### Supermetrics (`mcp__f5727907-...`)

Extrae datos de marketing y analítica de más de 150 fuentes (Google Ads, Meta Ads, Google Analytics, TikTok Ads, etc.).

**Flujo de trabajo (seguir siempre este orden):**
1. `data_source_discovery()` — listar fuentes y verificar estado de autenticación.
2. `data_source_discovery(ds_id=X)` — obtener configuración: cuentas, campos, tipos de reporte, ajustes requeridos.
3. `accounts_discovery(ds_id=X)` si `has_account_list` es verdadero.
4. `field_discovery(ds_id=X)` si `has_fields` es verdadero.
5. `data_query(...)` — pasar `report_type` y todos los ajustes dentro del objeto `settings`.
6. `get_async_query_results(schedule_id=...)` — consultar hasta que esté listo.

**Reglas:** Nunca fabricar datos. Usar solo los IDs de campo devueltos por `field_discovery` — nunca los nombres de visualización. Si una fuente requiere autenticación, compartir el enlace de inicio de sesión obtenido de `data_source_discovery`.

## Convenciones clave

- Todos los precios están en **PEN**. Al crear o actualizar productos, siempre establecer `currencyCode: "PEN"`.
- Todo el texto dirigido al cliente (títulos, descripciones, campos SEO) debe estar escrito en **español**.
- La tienda vende productos digitales/descargables — el seguimiento de inventario físico no aplica.
- Al ejecutar analítica con ShopifyQL, el rango de fechas predeterminado son los últimos 30 días, salvo que se indique lo contrario.
- Los GIDs de productos siguen el patrón `gid://shopify/Product/<id_numérico>`; los GIDs de variantes siguen `gid://shopify/ProductVariant/<id_numérico>`.
