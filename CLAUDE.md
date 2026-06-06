# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is the workspace for **Duerme toda la noche** (`duermetodalanoche.com`), a Shopify store based in Peru that sells digital sleep-training products for parents. There is no application source code — this repo serves as the operational base for managing the store and its marketing through connected MCP tools.

**Store context:**
- **Currency:** PEN (Peruvian Sol, S/.)
- **Timezone:** UTC-5 (Lima, Peru)
- **Language:** Spanish (all product copy, descriptions, and customer-facing content should be in Spanish)
- **Plan:** Shopify
- **Current catalog:** 1 digital product — *Método pequeño durmiente* (sleep-training guide, S/. 37.00)

## Connected MCP Tools

Two MCP servers are available in every session.

### Shopify (`mcp__f671a2e6-...`)

Manages the store directly via the Shopify Admin API.

| Capability | Primary tool(s) |
|---|---|
| Store details | `get-shop-info` |
| Products — read | `search_products`, `get-product` |
| Products — write | `create-product`, `update-product`, `bulk-update-product-status` |
| Collections | `search_collections`, `get-collection`, `create-collection`, `update-collection`, `add-to-collection` |
| Orders | `list-orders`, `get-order` |
| Customers | `list-customers` |
| Inventory | `get-inventory-levels`, `set-inventory` |
| Analytics | `run-analytics-query` (ShopifyQL) |
| Discounts | `create-discount` |
| Anything else | `graphql_query` / `graphql_mutation` (use for metafields, pages, blogs, gift cards, markets, etc.) |

**GraphQL decision rule:** prefer a dedicated tool when one exists; fall back to `graphql_query` or `graphql_mutation` for everything else. Never tell the user something is unavailable just because there is no dedicated tool.

Before writing any GraphQL, call `graphql_schema` to inspect available types and `validate_graphql_codeblocks` to check syntax before mutating.

### Supermetrics (`mcp__f5727907-...`)

Pulls marketing and analytics data from 150+ sources (Google Ads, Meta Ads, Google Analytics, TikTok Ads, etc.).

**Workflow (always follow this order):**
1. `data_source_discovery()` — list sources and check auth status.
2. `data_source_discovery(ds_id=X)` — get config: accounts, fields, report types, required settings.
3. `accounts_discovery(ds_id=X)` if `has_account_list` is true.
4. `field_discovery(ds_id=X)` if `has_fields` is true.
5. `data_query(...)` — pass `report_type` and all settings inside the `settings` object.
6. `get_async_query_results(schedule_id=...)` — poll until ready.

**Rules:** Never fabricate data. Only use field IDs returned by `field_discovery` — never display names. If a source needs auth, share the login link from `data_source_discovery`.

## Key Conventions

- All prices are in **PEN**. When creating or updating products, always set `currencyCode: "PEN"`.
- All customer-facing text (titles, descriptions, SEO fields) must be written in **Spanish**.
- The store sells digital/downloadable products — physical inventory tracking is not applicable.
- When running ShopifyQL analytics, default date ranges to the last 30 days unless specified otherwise.
- Product GIDs follow the pattern `gid://shopify/Product/<numeric_id>`; variant GIDs follow `gid://shopify/ProductVariant/<numeric_id>`.
