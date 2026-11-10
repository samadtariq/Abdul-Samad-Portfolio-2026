import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import { createServer } from "node:net";
import path from "node:path";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../app.js";
import { models } from "../models/index.js";
const origin = "http://localhost:3000";
function run(file, env) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [file], {
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    p.stdout.on("data", (x) => (out += x));
    p.stderr.on("data", (x) => (out += x));
    p.on("error", reject);
    p.on("exit", (code) =>
      code === 0 ? resolve(out) : reject(new Error(out)),
    );
  });
}
const payload = (doc) =>
  Object.fromEntries(
    Object.entries(doc).filter(
      ([k]) =>
        ![
          "_id",
          "createdAt",
          "updatedAt",
          "publishedAt",
          "readingTimeMinutes",
        ].includes(k),
    ),
  );
test("isolated database, authenticated CMS and public SSR integration", async (t) => {
  const guardedKeys = [
    "NODE_ENV",
    "UPLOAD_MAX_MB",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
    "NOTIFY_EMAIL",
  ];
  const originalEnv = Object.fromEntries(
    guardedKeys.map((k) => [k, process.env[k]]),
  );
  guardedKeys.forEach((k) => delete process.env[k]);
  process.env.NODE_ENV = "test";
  process.env.UPLOAD_MAX_MB = "25";
  const temp = await mkdtemp(path.join(os.tmpdir(), "samad-test-"));
  const mongo = await MongoMemoryServer.create({
    instance: {
      args: [
        "--nounixsocket",
        "--setParameter",
        "diagnosticDataCollectionEnabled=false",
      ],
    },
  });
  const env = {
    MONGODB_URI: mongo.getUri(),
    MONGODB_DB: "samad_integration",
    ADMIN_EMAIL: "owner@example.test",
    ADMIN_PASSWORD: "temporary-test-password-2971",
    ADMIN_NAME: "Abdul Samad",
  };
  let csrf, project, post, media, video, venture, category, teaser;
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB });
  const app = createApp({ siteUrl: origin, uploadDir: temp }),
    publicClient = request(app),
    owner = request.agent(app);
  const mutate = (method, url, data) =>
    owner[method](url)
      .set("Origin", origin)
      .set("X-CSRF-Token", csrf)
      .send(data);
  try {
    await t.test(
      "versioned migrations are repeatable and do not overwrite defaults",
      async () => {
        await run("seed/migrate.js", env);
        const count = await models.home_sections.countDocuments();
        assert.equal(count, 10);
        await models.portfolio_settings.updateOne(
          { key: "main" },
          { $set: { heroDescription: "Saved owner text" } },
        );
        await run("seed/migrate.js", env);
        assert.equal(
          (await models.portfolio_settings.findOne({ key: "main" }))
            .heroDescription,
          "Saved owner text",
        );
        assert.equal(
          await mongoose.connection
            .collection("_schema_migrations")
            .countDocuments(),
          1,
        );
        venture = (await models.ventures.findOne({ slug: "bol-hi" })).toJSON();
        assert.equal(venture.name, "Bol Hi");
        assert.equal(venture.publicationStatus, "draft");
        await assert.rejects(() =>
          mongoose.connection
            .collection("projects")
            .insertOne({ title: "Missing required fields" }),
        );
        await assert.rejects(() =>
          models.services.create({
            title: "Bad slug",
            slug: "INVALID / slug",
            publicationStatus: "draft",
          }),
        );
      },
    );
    await t.test(
      "unknown existing databases are rejected before migration",
      async () => {
        const db = mongoose.connection.getClient().db("samad_unknown");
        await db.collection("unrelated").insertOne({ keep: true });
        await assert.rejects(
          () => run("seed/migrate.js", { ...env, MONGODB_DB: "samad_unknown" }),
          /not empty/,
        );
        assert.equal(await db.collection("unrelated").countDocuments(), 1);
        assert.equal(await db.collection("projects").countDocuments(), 0);
      },
    );
    await t.test(
      "explicit admin creation and cookie login; auth/origin/CSRF enforcement",
      async () => {
        assert.equal(
          (await publicClient.get("/api/admin/projects")).status,
          401,
        );
        await run("seed/createAdmin.js", env);
        assert.equal(
          (
            await publicClient
              .post("/api/auth/login")
              .set("Origin", "https://invalid.test")
              .send({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD })
          ).status,
          403,
        );
        const res = await owner
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
        assert.equal(res.status, 200, res.text);
        csrf = res.body.csrf;
        assert.match(res.headers["set-cookie"][0], /HttpOnly/);
        assert.match(res.headers["set-cookie"][0], /SameSite=Strict/);
        assert.equal(
          (
            await owner
              .post("/api/admin/projects")
              .set("Origin", origin)
              .send({})
          ).status,
          403,
        );
        assert.equal(
          (
            await owner
              .post("/api/admin/projects")
              .set("Origin", "https://invalid.test")
              .set("X-CSRF-Token", csrf)
              .send({})
          ).status,
          403,
        );
        assert.equal(
          (await owner.get("/api/auth/me")).body.user.email,
          env.ADMIN_EMAIL,
        );
      },
    );
    await t.test(
      "URL validation reports exact nested fields without saving invalid settings",
      async () => {
        const settings = (await owner.get("/api/admin/portfolio_settings")).body
          .items[0];
        const result = await mutate(
          "put",
          "/api/admin/portfolio_settings/" + settings._id,
          {
            ...payload(settings),
            socialLinks: [
              {
                platform: "linkedin",
                url: "linkedin.com/in/example",
                visible: true,
              },
              {
                platform: "instagram",
                url: "javascript:alert(1)",
                visible: true,
              },
            ],
            defaultSeo: { canonicalUrl: "wrong-address" },
          },
        );
        assert.equal(result.status, 400, result.text);
        assert.deepEqual(Object.keys(result.body.fieldErrors).sort(), [
          "defaultSeo.canonicalUrl",
          "socialLinks[0].url",
          "socialLinks[1].url",
        ]);
        assert.match(
          result.body.fieldErrors["socialLinks[0].url"],
          /Social Links 1.*linkedin/,
        );
        assert.match(
          result.body.fieldErrors["socialLinks[1].url"],
          /instagram/,
        );
        assert.equal(
          (await models.portfolio_settings.findOne({ key: "main" }))
            .heroDescription,
          settings.heroDescription,
        );
      },
    );
    await t.test(
      "draft CRUD, strict fields, bad URLs, reference and publication filtering",
      async () => {
        const res = await mutate("post", "/api/admin/projects", {
          title: "Integration case study",
          slug: "integration-case",
          summary: "A test case, never seeded as real client work.",
          publicationStatus: "draft",
          progressStatus: "in_development",
          category: "mern",
          content: [
            { type: "heading", level: 2, text: "Overview" },
            {
              type: "paragraph",
              text: "Test-only overview, challenge and approach.",
            },
          ],
        });
        assert.equal(res.status, 201, res.text);
        project = res.body;
        assert.equal(
          (await publicClient.get("/projects/integration-case")).status,
          404,
        );
        assert.equal(
          (
            await publicClient.get(
              `/projects/integration-case?preview=projects:${project._id}`,
            )
          ).status,
          401,
        );
        const preview = await owner.get(
          `/projects/integration-case?preview=projects:${project._id}`,
        );
        assert.equal(preview.status, 200, preview.text);
        assert.match(preview.text, /noindex,nofollow/);
        assert.equal(
          (
            await mutate("put", `/api/admin/projects/${project._id}`, {
              ...payload(project),
              inventedField: true,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await mutate("put", `/api/admin/projects/${project._id}`, {
              ...payload(project),
              websiteUrl: "javascript:alert(1)",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await mutate("put", `/api/admin/projects/${project._id}`, {
              ...payload(project),
              coverId: "123456789012345678901234",
            })
          ).status,
          400,
        );
        const pub = await mutate("put", `/api/admin/projects/${project._id}`, {
          ...payload(project),
          publicationStatus: "published",
        });
        assert.equal(pub.status, 200, pub.text);
        project = pub.body;
        assert.ok(
          Math.abs(Date.now() - Date.parse(project.publishedAt)) < 6000,
        );
        const page = await publicClient.get("/projects/integration-case");
        assert.equal(page.status, 200, page.text);
        assert.match(page.text, /Test-only overview/);
      },
    );
    await t.test(
      "upload sniffing, private media, image/video roundtrip and delete references",
      async () => {
        const png = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3bkAAAAASUVORK5CYII=",
          "base64",
        );
        const upload = await owner
          .post("/api/media/upload")
          .set("Origin", origin)
          .set("X-CSRF-Token", csrf)
          .attach("file", png, "test.png");
        assert.equal(upload.status, 201, upload.text);
        media = upload.body;
        assert.equal(
          (await publicClient.get("/media/" + media._id)).status,
          404,
        );
        const bad = await owner
          .post("/api/media/upload")
          .set("Origin", origin)
          .set("X-CSRF-Token", csrf)
          .attach("file", Buffer.from("<script>alert(1)</script>"), "fake.png");
        assert.equal(bad.status, 400);
        const upVideo = await owner
          .post("/api/media/upload")
          .set("Origin", origin)
          .set("X-CSRF-Token", csrf)
          .attach("file", "tests/fixtures/tiny.mp4");
        assert.equal(upVideo.status, 201, upVideo.text);
        video = upVideo.body;
        assert.equal(video.kind, "video");
        const author = (await models.admins.findOne())._id.toString();
        const cat = await mutate("post", "/api/admin/blog_categories", {
          name: "Testing",
          slug: "testing",
          description: "Test category",
        });
        assert.equal(cat.status, 201, cat.text);
        category = cat.body;
        const data = {
          title: "Image and video roundtrip",
          slug: "media-roundtrip",
          excerpt: "Testing structured content and safe rendering.",
          authorId: author,
          publicationStatus: "draft",
          categoryIds: [category._id],
          coverId: media._id,
          content: [
            { type: "heading", level: 2, text: "Media in context" },
            {
              type: "image",
              mediaId: media._id,
              alt: "Test image",
              caption: "Image caption",
            },
            { type: "video", mediaId: video._id, caption: "Video caption" },
            {
              type: "youtube",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              caption: "Approved provider",
            },
            {
              type: "link",
              text: "Read the project",
              url: "/projects/integration-case",
            },
            {
              type: "code",
              text: '<script>alert("escaped")</script>',
              language: "html",
            },
            { type: "list", ordered: true, items: ["One", "Two"] },
          ],
        };
        let res = await mutate("post", "/api/admin/blog_posts", data);
        assert.equal(res.status, 201, res.text);
        post = res.body;
        assert.equal(
          (
            await mutate("put", `/api/admin/blog_posts/${post._id}`, {
              ...payload(post),
              content: [
                { type: "youtube", url: "https://evil.test/embed/dQw4w9WgXcQ" },
              ],
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await mutate("put", `/api/admin/blog_posts/${post._id}`, {
              ...payload(post),
              content: [{ type: "image", mediaId: video._id }],
            })
          ).status,
          400,
        );
        res = await mutate("put", `/api/admin/blog_posts/${post._id}`, {
          ...payload(post),
          publicationStatus: "published",
        });
        assert.equal(res.status, 200, res.text);
        post = res.body;
        assert.deepEqual(post.content, data.content);
        const fetched = await owner.get(`/api/admin/blog_posts/${post._id}`);
        assert.deepEqual(fetched.body.content, data.content);
        const page = await publicClient.get("/blog/media-roundtrip");
        assert.equal(page.status, 200, page.text);
        assert.match(page.text, /<video/);
        assert.match(page.text, /youtube-nocookie/);
        assert.match(page.text, /<ol>/);
        assert.match(page.text, /&lt;script&gt;/);
        assert.doesNotMatch(page.text, /<script>alert/);
        assert.equal(
          (await publicClient.get("/media/" + media._id)).status,
          200,
        );
        assert.equal(
          (await publicClient.get("/media/" + video._id)).status,
          200,
        );
        assert.equal(
          (await mutate("delete", "/api/admin/media/" + media._id)).status,
          400,
        );
      },
    );
    await t.test(
      "media picker filters, searches and paginates authenticated media",
      async () => {
        const png = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3bkAAAAASUVORK5CYII=",
          "base64",
        );
        const { uploadFiles } =
          await import("../../client/src/admin/components/mediaUploadQueue.js");
        const files = Array.from({ length: 20 }, (_, i) => ({
          name: `picker-batch-${i}.png`,
        }));
        const results = await uploadFiles(files, async (file) => {
          const out = await owner
            .post("/api/media/upload")
            .set("Origin", origin)
            .set("X-CSRF-Token", csrf)
            .attach("file", png, file.name);
          assert.equal(out.status, 201, out.text);
          return out.body;
        });
        assert.equal(results.filter((r) => r.item).length, 20);
        const images = await owner.get(
          "/api/admin/media?kind=image&q=picker-batch",
        );
        assert.equal(images.status, 200);
        assert.equal(images.body.total, 20);
        assert.ok(images.body.items.every((x) => x.kind === "image"));
        const videos = await owner.get("/api/admin/media?kind=video");
        assert.ok(videos.body.items.some((x) => x._id === video._id));
        assert.ok(videos.body.items.every((x) => x.kind === "video"));
        const none = await owner.get(
          "/api/admin/media?kind=document&q=picker-batch",
        );
        assert.equal(none.body.total, 0);
        const next = await owner.get(
          "/api/admin/media?kind=image&q=picker-batch&page=2",
        );
        assert.equal(next.body.items.length, 0);
        assert.equal(next.body.total, 20);
        assert.equal(
          (await owner.get("/api/admin/media?kind=wrong")).status,
          400,
        );
        assert.equal(
          (await publicClient.get("/api/admin/media?kind=image")).status,
          401,
        );
      },
    );
    await t.test(
      "private notes never leave admin and teaser has separate public content",
      async () => {
        const note = await mutate("post", "/api/admin/private_notes", {
          targetType: "venture",
          targetId: venture._id,
          body: "SECRET_UNDISCLOSED_FEATURES_TEST",
          authorId: (await models.admins.findOne())._id.toString(),
        });
        assert.equal(note.status, 201, note.text);
        let v = await mutate("put", "/api/admin/ventures/" + venture._id, {
          ...payload(venture),
          summary: "A new venture by Abdul Samad. Updates will follow.",
          publicationStatus: "published",
        });
        assert.equal(v.status, 200, v.text);
        venture = v.body;
        const res = await mutate("post", "/api/admin/teasers", {
          title: "Bol Hi — Coming Soon",
          slug: "bol-hi-coming-soon",
          targetType: "venture",
          targetId: venture._id,
          summary: "A new chapter is taking shape. Follow for public updates.",
          publicationStatus: "published",
          featured: true,
        });
        assert.equal(res.status, 201, res.text);
        teaser = res.body;
        for (const route of [
          "/",
          "/ventures/bol-hi",
          "/coming-soon/bol-hi-coming-soon",
        ]) {
          const page = await publicClient.get(route);
          assert.equal(page.status, 200, page.text);
          assert.doesNotMatch(
            page.text,
            /SECRET_UNDISCLOSED_FEATURES_TEST|passwordHash|tokenHash|storageKey/,
          );
        }
      },
    );
    await t.test(
      "contact persists and inbox supports read/unread/archive",
      async () => {
        assert.equal(
          (
            await publicClient
              .post("/api/contact")
              .set("Origin", origin)
              .send({ name: "Visitor", email: "invalid", message: "Hello" })
          ).status,
          400,
        );
        const result = await publicClient
          .post("/api/contact")
          .set("Origin", origin)
          .send({
            name: "Test Visitor",
            email: "visitor@example.test",
            message: "A saved project inquiry from the test suite.",
          });
        assert.equal(result.status, 201, result.text);
        const list = await owner.get("/api/admin/inquiries");
        assert.equal(list.body.total, 1);
        const inquiry = list.body.items[0];
        assert.equal(inquiry.status, "unread");
        for (const status of ["read", "unread", "archived"])
          assert.equal(
            (
              await mutate("put", "/api/admin/inquiries/" + inquiry._id, {
                status,
              })
            ).body.status,
            status,
          );
        assert.doesNotMatch(
          (await publicClient.get("/")).text,
          /visitor@example.test|A saved project inquiry/,
        );
      },
    );
    await t.test(
      "settings, optional field clearing and public SEO sitemap stay consistent",
      async () => {
        let setting = (await owner.get("/api/admin/portfolio_settings")).body
          .items[0];
        let res = await mutate(
          "put",
          "/api/admin/portfolio_settings/" + setting._id,
          {
            ...payload(setting),
            heroDescription: "Persisted settings proof.",
            profileImageId: media._id,
            floatingControls: {
              enabled: false,
              platforms: [],
              comingSoonEnabled: true,
              comingSoonLabel: "Coming Soon 👀",
              featuredTeaserIds: [teaser._id],
              animationEnabled: true,
            },
          },
        );
        assert.equal(res.status, 200, res.text);
        setting = res.body;
        const cleared = payload(setting);
        delete cleared.profileImageId;
        res = await mutate(
          "put",
          "/api/admin/portfolio_settings/" + setting._id,
          cleared,
        );
        assert.equal(res.status, 200, res.text);
        assert.equal(res.body.profileImageId, undefined);
        assert.match(
          (await publicClient.get("/")).text,
          /Persisted settings proof/,
        );
        const seo = await publicClient.get("/blog/media-roundtrip");
        assert.match(
          seo.text,
          /<link rel="canonical" href="http:\/\/localhost:3000\/blog\/media-roundtrip"/,
        );
        assert.match(seo.text, /BlogPosting/);
        const sitemap = await publicClient.get("/sitemap.xml");
        assert.match(sitemap.text, /media-roundtrip/);
        assert.doesNotMatch(sitemap.text, /\/admin|\/privacy/);
        const draft = await mutate("put", "/api/admin/blog_posts/" + post._id, {
          ...payload(post),
          publicationStatus: "draft",
        });
        assert.equal(draft.status, 200, draft.text);
        post = draft.body;
        assert.equal(
          (await publicClient.get("/blog/media-roundtrip")).status,
          404,
        );
        assert.doesNotMatch(
          (await publicClient.get("/sitemap.xml")).text,
          /media-roundtrip/,
        );
        assert.equal(
          (await publicClient.get("/media/" + media._id)).status,
          404,
        );
        const search = await publicClient.get("/projects?q=missing");
        assert.doesNotMatch(search.text, />Integration case study<\/h3>/);
        assert.equal((await publicClient.get("/not-a-route")).status, 404);
        assert.match(
          (await publicClient.get("/admin")).text,
          /noindex,nofollow/,
        );
      },
    );
    await t.test(
      "CMS service process, homepage order, social settings, privacy and pagination render saved content",
      async () => {
        const service = (await owner.get("/api/admin/services")).body.items[0];
        const serviceSaved = await mutate(
          "put",
          "/api/admin/services/" + service._id,
          {
            ...payload(service),
            process: [
              {
                title: "Discuss the brief",
                description: "A saved editable service process.",
              },
            ],
            faqs: [
              {
                question: "How does the work begin?",
                answer: "With a conversation.",
              },
            ],
            relatedProjectIds: [project._id],
          },
        );
        assert.equal(serviceSaved.status, 200, serviceSaved.text);
        const servicePage = await publicClient.get("/services/" + service.slug);
        assert.match(servicePage.text, /Discuss the brief/);
        assert.match(servicePage.text, /How does the work begin/);
        const skill = await mutate("post", "/api/admin/skill_items", {
          group: "skills",
          title: "Test skill",
          description: "Visible focus area",
          visible: true,
          displayOrder: 0,
        });
        assert.equal(skill.status, 201, skill.text);
        assert.match((await publicClient.get("/")).text, /Visible focus area/);
        const sections = (await owner.get("/api/admin/home_sections")).body
          .items;
        const section = sections.find((x) => x.key === "services");
        const saved = await mutate(
          "put",
          "/api/admin/home_sections/" + section._id,
          {
            ...payload(section),
            heading: "Services edited in CMS",
            displayOrder: 1,
          },
        );
        assert.equal(saved.status, 200, saved.text);
        assert.match(
          (await publicClient.get("/")).text,
          /Services edited in CMS/,
        );
        let settings = (await owner.get("/api/admin/portfolio_settings")).body
          .items[0];
        const setting = await mutate(
          "put",
          "/api/admin/portfolio_settings/" + settings._id,
          {
            ...payload(settings),
            navigation: [
              {
                key: "work",
                label: "My Work",
                href: "/projects",
                visible: true,
                displayOrder: 0,
              },
            ],
            mobileNavigation: [
              { label: "Home", url: "/", visible: true },
              { label: "More", url: "#more", visible: true },
            ],
            socialLinks: [
              {
                platform: "linkedin",
                url: "https://www.linkedin.com/in/example",
                visible: true,
                displayOrder: 0,
              },
              {
                platform: "whatsapp",
                url: "https://wa.me/1234567890",
                visible: true,
                displayOrder: 1,
              },
            ],
            floatingControls: {
              enabled: true,
              platforms: ["linkedin", "whatsapp"],
              comingSoonEnabled: true,
              comingSoonLabel: "Next chapter",
              featuredTeaserIds: [teaser._id],
              displayOrder: ["whatsapp", "linkedin", "coming-soon"],
              animationEnabled: false,
            },
            splash: { enabled: false },
          },
        );
        assert.equal(setting.status, 200, setting.text);
        const home = await publicClient.get("/");
        assert.match(home.text, /My Work/);
        assert.match(home.text, /https:\/\/wa.me\/1234567890/);
        assert.match(home.text, /Next chapter/);
        const update = await mutate(
          "put",
          "/api/admin/projects/" + project._id,
          {
            ...payload(project),
            videoId: video._id,
            gallery: [{ mediaId: video._id, caption: "Project video gallery" }],
          },
        );
        assert.equal(update.status, 200, update.text);
        project = update.body;
        const detail = await publicClient.get("/projects/integration-case");
        assert.equal((detail.text.match(/<video/g) || []).length, 2);
        const privacy = (await owner.get("/api/admin/pages")).body.items.find(
          (x) => x.key === "privacy",
        );
        assert.equal((await publicClient.get("/privacy")).status, 404);
        const publish = await mutate("put", "/api/admin/pages/" + privacy._id, {
          ...payload(privacy),
          publicationStatus: "published",
          content: [
            { type: "paragraph", text: "An owner-reviewed test policy." },
          ],
          seo: {
            title: "Privacy for visitors",
            description: "How inquiries and uploaded media are handled.",
          },
        });
        assert.equal(publish.status, 200, publish.text);
        assert.match(
          (await publicClient.get("/privacy")).text,
          /<title>Privacy for visitors<\/title>/,
        );
        assert.match(
          (await publicClient.get("/sitemap.xml")).text,
          /\/privacy/,
        );
        const now = new Date();
        for (let i = 0; i < 10; i++)
          await models.projects.create({
            title: "Pagination fixture " + i,
            slug: "pagination-fixture-" + i,
            summary: "Disposable database test.",
            category: "wordpress",
            publicationStatus: "published",
            publishedAt: now,
            progressStatus: "in_development",
          });
        const second = await publicClient.get(
          "/projects?category=wordpress&page=2",
        );
        assert.equal(second.status, 200);
        assert.match(second.text, /Page 2/);
        assert.match(second.text.replace(/<!--[\s\S]*?-->/g, ""), /10 items/);
        assert.equal(
          (
            await owner
              .post("/api/media/upload")
              .set("Origin", origin)
              .set("X-CSRF-Token", csrf)
              .attach("file", Buffer.alloc(26 * 1024 * 1024), "too-large.png")
          ).status,
          400,
        );
      },
    );
    await t.test("SMTP failure still saves the real inquiry", async () => {
      Object.assign(process.env, {
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: "9",
        SMTP_FROM: "portfolio@example.test",
        NOTIFY_EMAIL: "owner@example.test",
      });
      const result = await publicClient
        .post("/api/contact")
        .set("Origin", origin)
        .send({
          name: "SMTP test",
          email: "sender@example.test",
          message: "This inquiry must persist when SMTP is unavailable.",
        });
      assert.equal(result.status, 201, result.text);
      assert.equal(
        await models.inquiries.countDocuments({ name: "SMTP test" }),
        1,
      );
      for (const k of ["SMTP_HOST", "SMTP_PORT", "SMTP_FROM", "NOTIFY_EMAIL"])
        delete process.env[k];
    });
    await t.test(
      "password change revokes sessions, logout and session expiry are enforced",
      async () => {
        const res = await mutate("patch", "/api/auth/account", {
          name: "Abdul Samad",
          email: env.ADMIN_EMAIL,
          currentPassword: env.ADMIN_PASSWORD,
          newPassword: "new-temporary-password-84398",
        });
        assert.equal(res.status, 200, res.text);
        assert.equal((await owner.get("/api/auth/me")).status, 401);
        const login = await owner
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({
            email: env.ADMIN_EMAIL,
            password: "new-temporary-password-84398",
          });
        assert.equal(login.status, 200, login.text);
        csrf = login.body.csrf;
        assert.equal(
          (await mutate("post", "/api/auth/logout", {})).status,
          200,
        );
        assert.equal((await owner.get("/api/auth/me")).status, 401);
        await owner.post("/api/auth/login").set("Origin", origin).send({
          email: env.ADMIN_EMAIL,
          password: "new-temporary-password-84398",
        });
        await models.admin_sessions.updateMany(
          {},
          { $set: { expiresAt: new Date(Date.now() - 1000) } },
        );
        assert.equal((await owner.get("/api/auth/me")).status, 401);
      },
    );
    await t.test(
      "documented server entry starts and serves health/public routes",
      async () => {
        const port = await new Promise((resolve) => {
          const probe = createServer();
          probe.listen(0, "127.0.0.1", () => {
            const number = probe.address().port;
            probe.close(() => resolve(number));
          });
        });
        const child = spawn(process.execPath, ["server.js"], {
          env: {
            ...process.env,
            ...env,
            PORT: String(port),
            SITE_URL: "http://127.0.0.1:" + port,
            UPLOAD_DIR: temp,
          },
          stdio: ["ignore", "pipe", "pipe"],
        });
        try {
          await new Promise((resolve, reject) => {
            let output = "";
            const timer = setTimeout(
              () => reject(new Error("Server startup timeout: " + output)),
              7000,
            );
            child.stdout.on("data", (d) => {
              output += d;
              if (output.includes("Local:")) {
                clearTimeout(timer);
                resolve();
              }
            });
            child.stderr.on("data", (d) => (output += d));
            child.on("exit", (code) => {
              clearTimeout(timer);
              reject(new Error("Server stopped: " + code + " " + output));
            });
            child.on("error", reject);
          });
          const health = await fetch(
            "http://127.0.0.1:" + port + "/api/health",
          );
          assert.deepEqual(await health.json(), { ok: true });
          assert.equal(
            (await fetch("http://127.0.0.1:" + port + "/about")).status,
            200,
          );
        } finally {
          if (child.exitCode === null) {
            const exited = new Promise((resolve) =>
              child.once("exit", resolve),
            );
            child.kill("SIGTERM");
            await exited;
          }
        }
      },
    );
    await t.test(
      "login and contact rate limits reject excess requests",
      async () => {
        let last;
        for (let i = 0; i < 16; i++)
          last = await publicClient
            .post("/api/auth/login")
            .set("Origin", origin)
            .send({ email: "nobody@example.test", password: "invalid" });
        assert.equal(last.status, 429);
        for (let i = 0; i < 11; i++)
          last = await publicClient
            .post("/api/contact")
            .set("Origin", origin)
            .send({ name: "Bot", email: "invalid", message: "short" });
        assert.equal(last.status, 429);
      },
    );
  } finally {
    guardedKeys.forEach((k) => {
      if (originalEnv[k] === undefined) delete process.env[k];
      else process.env[k] = originalEnv[k];
    });
    await mongoose.disconnect();
    await mongo.stop();
    await rm(temp, { recursive: true, force: true });
  }
});
