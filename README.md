# Abdul Samad — Portfolio & CMS

DUSSU jaisi `client` / `server` folder structure mein React + Express + MongoDB portfolio aur private CMS. Dono folders ke **apne package.json aur package-lock.json** hain. Website English mein hai; setup Roman Urdu mein hai. Koi deployment automatically nahi hota.

## Local setup — Windows PowerShell

Node.js 24 aur MongoDB 7+ install/run hon. ZIP extract karke project root mein terminal kholein. Root mein `client`, `server` aur yeh README honge; root par `npm install` nahi chalana.

Pehle frontend dependencies aur build:

```powershell
cd client
npm ci
npm run build
cd ../server
npm ci
Copy-Item .env.example .env
notepad .env
```

`server/.env` mein apna dedicated MongoDB URI/database aur exact browser URL set karein:

```dotenv
PORT=3000
SITE_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=abdul_samad_portfolio_dev
UPLOAD_DIR=./uploads
```

`localhost` aur `127.0.0.1` mix na karein: Origin protection configured SITE_URL ke against request check karti hai. MongoDB/SMTP secrets sirf `server/.env` mein rakhein. `client/.env.example` frontend configuration explain karta hai; frontend ke liye koi secret/variable required nahi hai.

Ab isi **server folder** mein migration/admin/start commands:

```powershell
npm run db:migrate
$env:ADMIN_EMAIL = Read-Host "Apna admin email"
$env:ADMIN_NAME = "Abdul Samad"
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", (Read-Host "Admin password (12+ characters)" -AsSecureString)).Password
npm run db:admin
Remove-Item Env:ADMIN_PASSWORD,Env:ADMIN_EMAIL,Env:ADMIN_NAME
npm start
```

Website `http://localhost:3000`, admin `http://localhost:3000/admin`. Password 12+ characters aur maximum 72 UTF-8 bytes. Koi default password ya public registration nahi hai.

Agli dafa `server` folder mein `npm start`. Client code edit karne ke baad `client` mein `npm run build`, phir server restart karein.

## Development ke do terminals

**Terminal1, client folder:**

```powershell
npm run dev
```

Yeh frontend JavaScript/CSS aur SSR bundle ko watch/build karta hai. **Terminal2, server folder:**

```powershell
npm run dev
```

Website Express ke configured URL (default 3000) par hi khulegi. Browser refresh karein; agar SSR edit reflect na ho to server restart karein. Separate packages ke bawajood existing same-origin SSR approach retain hai, isliye client dev command alag 5173 website server nahi chalati. Build tool esbuild hai; Vite mein conversion is folder refactor ka hissa nahi hai.

## macOS / Linux

Project root se:

```bash
cd client
npm ci
npm run build
cd ../server
npm ci
cp .env.example .env
# server/.env mein apna dedicated MongoDB URI/database aur SITE_URL set karein.
npm run db:migrate
export ADMIN_EMAIL='your-real-email@example.com'
export ADMIN_NAME='Abdul Samad'
read -rsp 'Admin password (12+ characters): ' ADMIN_PASSWORD
export ADMIN_PASSWORD
npm run db:admin
unset ADMIN_PASSWORD ADMIN_EMAIL ADMIN_NAME
npm start
```

## Agar purana version already setup kiya tha

Apni existing `.env` ko naye `server/.env` mein copy karein. Purane upload folder ki files naye `server/uploads` mein copy karein, ya `UPLOAD_DIR` ko existing durable folder ke absolute path par rakhein. Wohi MongoDB URI/database use kar sakte hain. Folder refactor mein collection names, document IDs, schema, migration checksums ya content change nahi kiya gaya; database reset ki zaroorat nahi hai. Naya admin banane ki command sirf tab chalayein jab account pehle bana nahi hai.

## Admin se pehla content setup

1. **Profile & Hero:** bio, roles, location, contact details, photo position aur resume set karein. Supplied portrait fallback ke taur par already included hai. Hero photo mode mein hai. Future video ke liye Media Library mein video upload karke hero video mode/file choose karein.
2. **Ventures:** Bibros Solutions, DUSSU Store aur **Bol Hi** drafts mein hain. Apne actual public descriptions/logos/launch states add karke publish karein. Bol Hi ke liye date ya undisclosed features assume nahi kiye gaye.
3. **Projects:** apni actual case studies, overview/challenge/approach/features, technologies aur galleries add karein. Optional live/code links blank ho sakte hain. Results tabhi likhein jab aapke paas real results hon.
4. **Skills & Process:** `group` se skills, process, beyond_code choose karein. Homepage Sections mein visibility, numeric order aur featured selections set karein. Default order hero ke foran baad Ventures rakhta hai.
5. **Coming Soon:** project/venture ko reference karke alag public teaser banayein. Linked item draft reh sakta hai; teaser uska private content publish nahi karta. Launch date optional hai. Private Notes module sirf authenticated admin ko milta hai.
6. **Blog & Articles:** title/slug/excerpt/author/categories aur content blocks add karein. Paragraph, heading, image, uploaded video, YouTube, link, quote, code aur ordered/unordered list available hain. Blocks reorder ho sakte hain. Media Library mein file upload karke editor mein select karein. Editor ko dobara kholne par nayi media options load hoti hain.
7. **Navigation & Footer:** desktop labels/URLs/order/visibility; dropdown ke liye child ka `parentKey` parent ke `key` se match karein. Mobile defaults Home / Projects / Ventures / Blog / More hain. More mein About/Services/Contact khulte hain.
8. **Floating Controls:** real social URLs aur visible checkboxes set karein. Platforms choose karein; order ke liye `displayOrder` mein `whatsapp`, `instagram`, `linkedin`, `facebook`, `coming-soon` ko one-per-line rakhein. Button ke liye published teaser select aur Coming Soon enable karein. Unconfigured social links hide rehte hain.
9. **Splash:** wording, duration, animation aur once-per-session behavior configure karein. Default 1.2 seconds; reduced motion par splash skip hota hai.
10. **Page Content & SEO / SEO Settings:** public page titles/descriptions/canonical/share image/noindex edit karein. About timeline aur optional actual statistics bhi editable hain. Privacy Policy draft hai; apni reviewed policy add karke publish karein.
11. **Inquiry Inbox:** saved submissions read/unread/archive karein. Optional Private Notes mein internal follow-up rakhein. Account mein current password dekar password/name/email change karne par sab sessions sign out hote hain.

Save ke baad **Preview Saved** authenticated draft kholta hai. Preview private/noindex hota hai. Unpublish karne par public detail URL 404 aur sitemap entry remove ho jati hai. Unused optional fields clear karke save kiye ja sakte hain. Referenced items/files delete nahi hote; pehle relationships remove karein.

Rich content structured blocks hai, arbitrary HTML editor nahi. HTML/script text safely escape hota hai. YouTube ke sirf valid HTTPS watch/share/embed links allow hain; iframe `youtube-nocookie.com` use karta hai. Links ke liye dedicated Link block hai.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | Biography/timeline |
| `/services` | Services |
| `/services/wordpress-development` | WordPress |
| `/services/mern-stack-development` | MERN |
| `/services/web-design` | Web Design |
| `/projects`, `/projects/:slug` | Listing and case study |
| `/ventures`, `/ventures/:slug` | Ventures and details |
| `/blog`, `/blog/:slug` | Articles and reading view |
| `/coming-soon`, `/coming-soon/:slug` | Teasers and details |
| `/contact` | Inquiry form |
| `/privacy` | Published policy, otherwise 404 |
| Other paths | Branded 404 with HTTP 404 |
| `/admin` | Private CMS |

## Database aur migration history

`npm run db:migrate` explicit command hai; server startup migrations nahi chalata aur unknown nonempty database adopt nahi karta.

- Supplied `001_initial_schema.mjs` aur `server/database/schema.json` original bytes mein preserved hain. Original nested `required: []` MongoDB 7 reject karta tha.
- Fresh databases corrected **002_application** migration se bootstrap hote hain; ledger mein002 likha jata hai,001 ko falsely applied nahi dikhaya jata.
- Existing recognized001 history mile to original checksum verify hota hai; compatible data par002 validators/indexes apply hote hain. Unknown ya incompatible DB par command stop hoti hai.
- `002.schema.json` frozen migration snapshot hai. `server/database/runtime.schema.json` usi ka runtime copy hai. Har model `server/models/` ki apni file mein register hota hai; field definitions shared runtime schema se banti hain. Models timestamps validation se pehle set karte hain, nested subdocuments mein extra `_id` nahi aata.
- Repeat migration content overwrite nahi karti. Defaults `$setOnInsert` se bante hain. No fake published projects/reviews/metrics seeded.
- Applied migration/snapshot ko edit na karein; future schema changes ke liye next numbered migration aur runtime schema update karein.
- Interrupted fresh setup mein partially created database ko automatically delete/adopt nahi kiya jata. Naye disposable database name se retry karein; valuable existing data ke liye backup aur explicit recovery karein.
- Stale lock par pehle ensure karein ke koi migrator run nahi ho raha. `_schema_migration_locks` ka `portfolio_schema` record inspect karke apne database administrator se stale lock clear karwayein. App lock ko timeout par khud nahi todta.

## Storage aur SMTP

Uploads default `server/uploads` mein hain. Relative UPLOAD_DIR server folder se resolve hota hai. Server image/video/PDF bytes sniff karta hai; SVG/executable uploads accept nahi hote. Default maximum25 MiB, `UPLOAD_MAX_MB` configurable (server maximum200 MiB). Random storage keys hain; original filename URL/path nahi banta. Draft-only/unreferenced files signed-in admin tak restricted rehti hain. Publicly referenced media public ho jati hai; private documents ko public sections se attach na karein.

`server/services/storageService.js` local storage adapter hai. Production ke liye `UPLOAD_DIR` ko **durable persistent volume** par set karein aur MongoDB ke saath uploads ka backup bhi lein. Ephemeral/serverless filesystem ko durable storage na samjhein. Object storage chahiye to isi interface mein adapter implement karein; current source automatically S3/R2 use nahi karta.

SMTP optional hai. `.env.example` mein `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL` fill karein. SMTP absent/fail ho tab bhi inquiry database mein save hoti hai. Actual email delivery credentials ke bina verify nahi ki gayi.

## SEO, auth aur deployment requirements

Express public routes ko request time par React server-render karta hai; phir browser hydrate karta hai. Newly published database content agli request par crawlable HTML, metadata aur sitemap mein aa jata hai. Detail routes direct refresh support karte hain. Search/filter pagination server query par hoti hai. Person / BlogPosting structured data sirf stored public identity/article data se banta hai. Google indexing/rankings guarantee nahi ki gayi.

Passwords bcrypt se hash hote hain. Random session cookie HttpOnly/SameSite=Strict hai, production mein Secure bhi hai. Raw session token DB mein store nahi hota. Server-side session expiry/revocation, CSRF token, exact Origin check aur login/contact rate limiting implemented hain. Public registration/CORS allow-all endpoint nahi hai. Admin/preview noindex aur private responses no-store hain. Admin mutations allowlisted aur references/media kinds validated hain.

Actual hosting ke liye long-running Node process, reachable MongoDB, durable upload volume aur HTTPS reverse proxy chahiye. Yeh static-only hosting bundle nahi hai. Production mein:

- `NODE_ENV=production`, actual HTTPS `SITE_URL` aur secrets configure karein.
- Reverse proxy ka topology verify karke hi `TRUST_PROXY=1` set karein; default0 hai.
- Client folder mein `npm ci` aur `npm run build`; server folder mein `npm ci`, explicitly `npm run db:migrate`, phir `npm start` run karein. Node host par dono sibling folders aur client runtime React dependencies available hon.
- HTTPS/domain/email/uploads backup apne chosen host par configure karein. Multiple app instances ke liye shared durable upload storage aur shared rate-limit store add karein; current limiter per-process hai.
- Google Fonts external requests aur configured YouTube embeds ko apni privacy policy mein account karein.

Koi domain purchase, paid account, live deployment ya production database change nahi kiya gaya.

## Verification

Project root se:

```bash
npm --prefix server test
npm --prefix client audit --omit=dev
npm --prefix server audit --omit=dev
```

Server test command client build bhi karta hai; pehle dono folders mein dependencies installed hon.

Tests disposable MongoDB start karte hain; first run par MongoDB binary download ke liye internet lag sakta hai. Existing database use/delete nahi hota. Fixtures test-only hain; migration ke defaults mein fake published content add nahi hota.

Integration checks migration repeatability/strict DB validation, unknown DB rejection, admin creation/auth, cookie/origin/CSRF, content CRUD/publication, private preview/notes, real image/video uploads and block roundtrip, file limits/reference deletion, inquiry persistence, settings/SEO/privacy, categories/pagination, password revocation aur rate limits cover karte hain.

Desktop aur390px responsive viewport mein real SSR page captures inspect kiye gaye: hero/portrait, splash completion, article, bottom navigation, More aur Coming Soon panels/Escape/focus return. Managed browser preview mein MongoDB executable run nahi hua, isliye **live browser admin-save/upload flow verify nahi hua**; backend flows real MongoDB HTTP integration tests se verified hain. Real phone keyboard/safe-area behavior, SMTP delivery aur aapke chosen production host par deployment abhi verify nahi kiye gaye.

Is refactor ke baad separate-package install/build aur real MongoDB integration suite dobara pass hui.17 public route variants ka SSR output previous build se compare hua: React hydration markers ke ilawa HTML identical tha; CSS bytes unchanged hain. Naya browser session is structural refactor mein repeat nahi kiya gaya. Latest exact results aur remaining owner content `IMPLEMENTATION_STATUS.md` mein hain.

## Source layout

Detailed map: `FOLDER_STRUCTURE.md`.

| Folder | Kaam |
| --- | --- |
| `client/src/pages` | Public page views; listing/detail templates CMS data se routes render karte hain |
| `client/src/components` | Layout, hero, cards, content blocks, contact and shared UI |
| `client/src/admin/pages` | Login, dashboard, collections, settings and account |
| `client/src/admin/components` | Fields, block editor, content editor and upload controls |
| `client/src/services` | Same-origin admin API/CSRF transport |
| `client/src/styles` | Approved responsive stylesheet |
| `client/public` | Supplied portrait and favicon |
| `client/scripts` | Browser/CSS/SSR build and watcher |
| `server/config` | Database connection, schema loading and absolute application paths |
| `server/controllers` | Auth, content CRUD, media, contact, dashboard and public responses |
| `server/routes` | Express routers and endpoint middleware wiring |
| `server/models` | Individual named Mongoose model modules and common schema factory |
| `server/middleware` | Sessions/auth, CSRF, security headers, uploads, limits and errors |
| `server/services` | Public data, SSR, email, storage and audit services |
| `server/utils` | Validation, serialization, HTML shell and crypto helpers |
| `server/seed` | Explicit migration and initial-admin commands |
| `server/database` | Unchanged immutable migration snapshots and runtime schema |
| `server/tests` | Isolated MongoDB integration tests and tiny video fixture |
| `server/uploads` | Runtime uploaded files; ZIP mein sirf empty folder marker |

`client/index.html` frontend-owned HTML shell hai, jise server SSR content/metadata ke saath fill karta hai. `client/src/main.jsx` browser hydration aur `entry-server.jsx` server rendering ka entry hai. `client/dist`/`dist-ssr` build ke baad generate hote hain. In generated folders ko manually edit na karein.

ZIP mein source, dono lockfiles, env examples aur docs hain. Node_modules, actual credentials, runtime databases/uploads aur build outputs include nahi hain.
