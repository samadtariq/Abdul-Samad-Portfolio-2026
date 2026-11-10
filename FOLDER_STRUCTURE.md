# DUSSU-style folder structure

Root ke andar `client/` aur `server/` independent packages hain. Root par README, status aur gitignore hain.

| Location | Actual files / responsibility |
| --- | --- |
| `client/` | package.json, package-lock.json, index.html, .env.example |
| `client/public/assets/` | abdul-samad.png, favicon.svg |
| `client/src/` | main.jsx, App.jsx, entry-server.jsx |
| `client/src/pages/` | HomePage, AboutPage, ContactPage, PrivacyPage, ListingPage, DetailPage, NotFoundPage |
| `client/src/components/layout/` | Header, Footer, Splash, FloatingControls |
| `client/src/components/home/` | HeroMonitor, RotatingRole |
| `client/src/components/content/` | CardGrid, ContentBlocks, Countdown |
| `client/src/components/contact/` | ContactForm, ContactSection |
| `client/src/components/ui/` | Icon, Modal, Badge, SectionTitle |
| `client/src/admin/` | AdminApp plus pages, components and field configuration |
| `client/src/services/` | adminApi.js; CSRF state sirf isi module mein |
| `client/src/styles/` | style.css |
| `client/src/utils/` | media, text, featured selections and page resolution |
| `client/scripts/` | build.js; client/CSS and SSR build/watch |
| `server/` | package.json, package-lock.json, .env.example, app.js, server.js |
| `server/config/` | database.js, paths.js, schema.js |
| `server/controllers/` | authController, dashboardController, contentController, mediaController, contactController, publicController |
| `server/routes/` | authRoutes, adminRoutes, mediaRoutes, contactRoutes, publicRoutes |
| `server/models/` | Admin, AdminSession, PortfolioSetting, Page, HomeSection, Service, SkillItem, Project, Venture, Teaser, PrivateNote, Media, BlogCategory, BlogPost, Inquiry, AuditLog |
| `server/middleware/` | auth, csrf, security, upload, rate limit and error middleware |
| `server/services/` | publicDataService, ssrService, emailService, storageService, auditService |
| `server/utils/` | validation, crypto, serialize, escapeHtml, html |
| `server/seed/` | migrate.js, createAdmin.js |
| `server/database/migrations/` | Original001 and immutable002 application migration/snapshot, unchanged |
| `server/database/runtime.schema.json` | Same frozen schema fields used by the model factory |
| `server/tests/` | integration.test.js and fixtures/tiny.mp4 |
| `server/uploads/` | Uploaded files; default storage root |

Individual model files register their real collection using createModel.js. Central schema fields prevent Mongoose/database-validator drift; schema changes require a new versioned migration.

Public routes share listing/detail templates so new projects, ventures, services, articles and teasers can be added from CMS without another code file for each record.

## Request flow

Route middleware authenticate/validate the request, controller handles it, services perform shared work, and models read/write MongoDB. Public controller loads published data and asks the client's server entry to render the React page. Browser assets and APIs share Express's origin.

## Commands

- Install/build frontend: client folder mein `npm ci`, phir `npm run build`.
- Install/configure backend: server folder mein `npm ci`, `.env.example` se `.env` banayein.
- Database/admin: server folder mein `npm run db:migrate` aur explicit credentials ke saath `npm run db:admin`.
- Run: server folder mein `npm start`.
- Tests: server folder mein `npm test`.

Build folders aur node_modules install/build ke baad generate hote hain; source ZIP mein include nahi hote.
