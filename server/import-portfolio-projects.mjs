import { MongoClient } from "mongodb";

const mern = ["MongoDB", "Express.js", "React", "Node.js"];

const projects = [
  {
    slug: "dussu-store",
    title: "DUSSU Store",
    websiteUrl: "https://www.dussu.store/",
    category: "mern",
    role: "Founder & Full-Stack Developer",
    technologies: mern,
    displayOrder: 1,
    featured: true,
    related: ["farmeri"],
    services: ["mern-stack-development"],
    ventureCover: "dussu-store",
    summary: "A custom MERN storefront for my streetwear brand, with collection browsing, product galleries, and cash-on-delivery checkout for customers in Pakistan.",
    overview: "DUSSU is my Karachi-based streetwear brand. I built its online store around the Wear Your Difference identity and its collections of graphic tees, jerseys, and customizable apparel.",
    challenge: "Shoppers needed to see each design clearly and place an order from a phone. The store also needed tools for managing products and new drops.",
    approach: "I gave collections and product photography priority. I built the checkout around Pakistani delivery addresses and cash on delivery, with admin tools for catalogue and media management.",
    features: ["Streetwear collections and featured products", "Product galleries for images and videos", "Guest checkout with cash on delivery in Pakistan", "Catalogue and media administration"],
    seoTitle: "DUSSU Store MERN E-commerce Project | Abdul Samad",
    seoDescription: "Explore Abdul Samad’s MERN streetwear store with product galleries, catalogue management, and cash-on-delivery checkout in Pakistan.",
  },
  {
    slug: "farmeri",
    title: "Farmeri",
    websiteUrl: "https://www.farmeri.pk/",
    category: "mern",
    role: "MERN Stack Developer",
    technologies: mern,
    displayOrder: 2,
    featured: true,
    related: ["dussu-store"],
    services: ["mern-stack-development"],
    summary: "A custom MERN e-commerce website for a Pakistani clothing brand with a product catalogue, detailed product photography, and storefront administration.",
    overview: "Farmeri was a client project for a clothing brand that needed an online store. The work covered the customer-facing storefront and the tools the brand uses to manage its catalogue.",
    challenge: "Clothing customers need to see the fit, material, and garment details. The client also needed to keep the catalogue current as collections changed.",
    approach: "The storefront gives product photography and collections clear space. Product pages support multiple visuals, while the admin panel provides tools for updating the catalogue.",
    features: ["Collection and product browsing", "Product media galleries", "Mobile-friendly product pages", "Admin catalogue and media management"],
    seoTitle: "Farmeri MERN E-commerce Website | Abdul Samad",
    seoDescription: "See Abdul Samad’s MERN e-commerce project for Farmeri, a Pakistani clothing store with product galleries and catalogue management.",
  },
  {
    slug: "naveed-umer-builders",
    title: "Naveed & Umer Builders",
    websiteUrl: "https://naveedandumerbuilders.com/",
    category: "wordpress",
    role: "WordPress Developer",
    technologies: ["WordPress"],
    displayOrder: 3,
    featured: true,
    related: ["beacon-academy-college"],
    services: ["wordpress-development"],
    summary: "A WordPress website for a construction and renovation company serving London and Surrey, with service pages, a project gallery, and quote enquiries.",
    overview: "The website helps homeowners explore the company’s construction services, see the areas it covers, and get in touch about a project.",
    challenge: "The company offers services ranging from house extensions to property maintenance. Visitors needed a straightforward way to find the relevant service and ask for a quote.",
    approach: "The layout gives services, coverage areas, and project photography their own space. Quote and contact links sit near the service information.",
    features: ["Renovation, extension, and refurbishment service pages", "Areas-served section for London and Surrey", "Project photo gallery", "Quote enquiries and click-to-call links"],
    seoTitle: "Naveed & Umer Builders WordPress Website | Abdul Samad",
    seoDescription: "Explore Abdul Samad’s WordPress project for a London and Surrey construction company, with service pages, a gallery, and quote enquiries.",
  },
  {
    slug: "bibros-solutions-website",
    title: "Bibros Solutions Agency Website",
    websiteUrl: "https://www.bibrossolutions.online/",
    category: "mern",
    role: "Founder & Web Developer",
    technologies: mern,
    displayOrder: 4,
    featured: true,
    related: ["naveed-umer-builders", "farmeri"],
    services: ["mern-stack-development", "wordpress-development"],
    ventureCover: "bibros-solutions",
    summary: "The agency website for Bibros Solutions, my web design and development venture, created to introduce its services and give prospective clients a way to get in touch.",
    overview: "Bibros Solutions is the agency I founded for web design and development. This project is the agency’s own website.",
    challenge: "Businesses looking for a WordPress site, an online store, or a custom application arrive with different questions. The website needed to explain those options clearly.",
    approach: "The design uses a dark palette and orange accents to carry the Bibros identity. The site is organised around the agency’s services, selected work, and project enquiries.",
    features: ["Agency homepage and visual identity", "Web design and development service presentation", "A place to showcase selected work", "Project enquiry and contact paths"],
    seoTitle: "Bibros Solutions Agency Website | Abdul Samad",
    seoDescription: "Explore Abdul Samad’s agency website project for Bibros Solutions, covering web design, WordPress, e-commerce, and custom development.",
  },
  {
    slug: "beacon-academy-college",
    title: "The Beacon Academy & College",
    websiteUrl: "https://ziauddinboardadmission.com/",
    category: "wordpress",
    role: "WordPress Developer",
    technologies: ["WordPress"],
    displayOrder: 5,
    featured: false,
    related: ["naveed-umer-builders"],
    services: ["wordpress-development"],
    summary: "A WordPress admissions website for The Beacon Academy & College in Karachi, where families can explore programmes, apply online, and contact the campus.",
    overview: "The site brings programme information and admissions into one place for families exploring Ziauddin Board, Matric, Intermediate, and Cambridge O and A Levels options.",
    challenge: "Families need different information before applying. Some want to compare programmes, while others want to start an application or speak with the campus.",
    approach: "The homepage makes the application option visible early and gives visitors a dedicated academic programmes section. The contact section offers a separate route for questions and directions.",
    features: ["Academic programme listings", "Online admission application form", "General enquiry form", "Campus location and directions"],
    seoTitle: "Beacon Academy Admissions Website | Abdul Samad",
    seoDescription: "Explore Abdul Samad’s Beacon Academy WordPress project in Karachi, featuring programme listings, online admissions, and campus enquiries.",
  },
  {
    slug: "blooming-petals",
    title: "Blooming Petals",
    websiteUrl: "https://samadtariq.github.io/Blooming-Petals/index.html",
    repositoryUrl: "https://github.com/samadtariq/Blooming-Petals",
    category: "web_design",
    role: "Front-end Developer · Team Project",
    technologies: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    displayOrder: 6,
    featured: false,
    related: [],
    services: [],
    summary: "A team-built front-end demo for a décor and event styling brand, with product browsing, comparison, and cart interfaces.",
    overview: "Blooming Petals is a front-end team project that presents event styling and decorative products in a storefront visitors can explore online.",
    challenge: "The team needed clear navigation between event inspiration, product browsing, comparison, and the cart.",
    approach: "We used HTML, CSS, JavaScript, and Bootstrap to build the front-end screens. The homepage introduces the brand and its products, with separate pages demonstrating comparison and cart interfaces.",
    features: ["Décor and event styling homepage", "Product, event, and review sections", "Product comparison and cart demo pages", "Public GitHub repository and GitHub Pages demo"],
    seoTitle: "Blooming Petals Front-End Project | Abdul Samad",
    seoDescription: "See a front-end décor storefront team project built with HTML, CSS, JavaScript, and Bootstrap, with comparison and cart demos.",
  },
];

const { MONGODB_URI: uri, MONGODB_DB: dbName } = process.env;
const preview = process.argv.includes("--preview");
const urlKey = value => {
  if (!value) return "";
  const url = new URL(value);
  return url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/index\.html$|\/$/g, "");
};
const mergeIds = (previous = [], added = []) =>
  [...new Map([...previous, ...added].map(id => [String(id), id])).values()];

async function run() {
  if (!uri || !dbName) throw new Error("Set MONGODB_URI and MONGODB_DB in server/.env first.");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    const migration = await db.collection("_schema_migrations").findOne({ _id: "002_application" });
    if (!migration) throw new Error("This database has no portfolio migration marker.");

    const collection = db.collection("projects");
    const [existing, services, ventures] = await Promise.all([
      collection.find().toArray(),
      db.collection("services").find({}).project({ slug: 1 }).toArray(),
      db.collection("ventures").find({}).project({ slug: 1, coverId: 1 }).toArray(),
    ]);
    const serviceIds = new Map(services.map(item => [item.slug, item._id]));
    const ventureCovers = new Map(ventures.map(item => [item.slug, item.coverId]));
    const now = new Date();

    const plan = projects.map(project => {
      const matches = existing.filter(record => {
        if (record.slug === project.slug) return true;
        try { return urlKey(record.websiteUrl) === urlKey(project.websiteUrl); }
        catch { return false; }
      });
      if (matches.length > 1) throw new Error(`Multiple records match ${project.title}. Resolve the duplicates before importing.`);
      const [old] = matches;
      const slug = old?.slug ?? project.slug;
      const content = ["Overview", "Challenge", "Approach", "Features"].flatMap(heading => [
        { type: "heading", level: 2, text: heading },
        heading === "Features"
          ? { type: "list", ordered: false, items: project.features }
          : { type: "paragraph", text: project[heading.toLowerCase()] },
      ]);
      const update = {
        title: project.title,
        websiteUrl: project.websiteUrl,
        category: project.category,
        role: project.role,
        technologies: project.technologies,
        summary: project.summary,
        content,
        publicationStatus: "published",
        progressStatus: "live",
        publishedAt: old?.publishedAt ?? now,
        updatedAt: now,
        "seo.title": project.seoTitle,
        "seo.description": project.seoDescription,
        "seo.noIndex": false,
      };
      if (project.repositoryUrl) update.repositoryUrl = project.repositoryUrl;
      const cover = old?.coverId ?? ventureCovers.get(project.ventureCover);
      if (cover && !old?.coverId) update.coverId = cover;
      if (cover && !old?.seo?.shareImageId) update["seo.shareImageId"] = cover;
      const relatedServices = project.services.map(key => serviceIds.get(key)).filter(Boolean);
      if (relatedServices.length) update.relatedServiceIds = mergeIds(old?.relatedServiceIds, relatedServices);
      return {
        project, old, slug,
        op: { updateOne: {
          filter: old ? { _id: old._id } : { slug },
          update: {
            $set: update,
            $setOnInsert: { slug, createdAt: now, displayOrder: project.displayOrder, featured: project.featured },
          },
          upsert: !old,
        } },
      };
    });
    if (new Set(plan.map(item => item.slug)).size !== projects.length) {
      throw new Error("Project slugs collide. Resolve duplicates before importing.");
    }

    for (const { old, slug } of plan) console.log(`${old ? "update" : "create"}: /projects/${slug}`);
    const missing = [...new Set(projects.flatMap(p => p.services).filter(slug => !serviceIds.has(slug)))];
    if (missing.length) console.log(`Service links skipped until available: ${missing.join(", ")}`);
    if (preview) return;

    await collection.bulkWrite(plan.map(({ op }) => op));
    const saved = await collection.find({
      slug: { $in: plan.map(item => item.slug) },
      publicationStatus: "published",
      progressStatus: "live",
    }).toArray();
    if (saved.length !== projects.length) throw new Error("Published project verification failed.");
    const bySlug = new Map(saved.map(item => [item.slug, item]));
    const byOriginalSlug = new Map(plan.map(item => [item.project.slug, bySlug.get(item.slug)]));
    const links = plan.flatMap(({ project, slug }) => {
      const record = bySlug.get(slug);
      const ids = project.related.map(key => byOriginalSlug.get(key)?._id).filter(Boolean);
      if (!ids.length) return [];
      return [{ updateOne: {
        filter: { _id: record._id },
        update: { $addToSet: { relatedProjectIds: { $each: ids } } },
      } }];
    });
    if (links.length) await collection.bulkWrite(links);
    console.log(`Verified ${saved.length} published projects in MongoDB.`);
  } finally {
    await client.close();
  }
}

try { await run(); }
catch (error) {
  const known = [
    "Set MONGODB_URI and MONGODB_DB in server/.env first.",
    "This database has no portfolio migration marker.",
    "Project slugs collide. Resolve duplicates before importing.",
    "Published project verification failed.",
  ];
  const safe = known.includes(error.message) || /^Multiple records match /.test(error.message);
  console.error(safe ? error.message : `Import stopped (${error.name}${error.code ? " " + error.code : ""}).`);
  process.exitCode = 1;
}
