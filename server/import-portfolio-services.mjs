import { MongoClient } from "mongodb";

const services = [
  {
    slug: "wordpress-development",
    title: "WordPress Development",
    summary: "I build WordPress websites and WooCommerce stores that businesses can update themselves.",
    heading: "WordPress websites for businesses",
    body: "I develop responsive company websites, service pages, and online stores with WordPress, Elementor, and WooCommerce. I organise the pages around what visitors need to do, such as reviewing services, browsing products, or sending an enquiry.",
    work: "My WordPress work includes Beacon Academy and Naveed & Umer Builders.",
    projects: ["Beacon Academy", "Naveed & Umer Builders", "Naveed and Umer Builders"],
    capabilities: ["WordPress website development", "Elementor page layouts", "WooCommerce setup", "Responsive design and on-page SEO"],
    deliverables: ["Working WordPress website", "Editable pages or product templates", "Website management handover"],
    faq: ["Can I edit the website myself?", "Yes. I structure the editable pages so you can update copy and images from WordPress."],
    seoTitle: "WordPress Developer | Abdul Samad",
    description: "Abdul Samad builds responsive WordPress websites and WooCommerce stores with Elementor, editable pages, and on-page SEO.",
  },
  {
    slug: "mern-stack-development",
    title: "MERN Stack Development",
    summary: "I build full-stack JavaScript applications using MongoDB, Express, React, and Node.js.",
    heading: "Custom MERN web applications",
    body: "I build React interfaces and Express APIs for storefronts, dashboards, and content-managed websites. I plan the MongoDB data model around the application’s workflows and connect the front end to the backend features the project needs.",
    work: "My MERN portfolio includes DUSSU Store, Bibros Solutions, my 2026 developer portfolio, and Farmeri, a client project.",
    projects: ["DUSSU Store", "Bibros Solutions", "Abdul Samad Portfolio 2026", "My Own Portfolio 2026", "Portfolio 2026", "Farmeri"],
    capabilities: ["React web interfaces", "Node.js and Express REST APIs", "MongoDB data modelling", "Admin dashboards and e-commerce workflows"],
    deliverables: ["Front-end and backend source code", "Database model and configuration guidance", "Setup and deployment instructions"],
    faq: ["Can you add an admin dashboard to a MERN app?", "Yes. I can build dashboard screens and connect them to the API and permissions the app requires."],
    seoTitle: "MERN Stack Developer | Abdul Samad",
    description: "MERN stack developer Abdul Samad builds custom React web apps, Express APIs, MongoDB-backed stores, and admin dashboards.",
  },
  {
    slug: "laravel-web-development",
    aliases: ["laravel-development", "laravel"],
    title: "Laravel Web Development",
    summary: "I build Laravel web applications, admin dashboards, and REST APIs for business workflows.",
    heading: "Laravel applications and APIs",
    body: "I use PHP, Laravel, and MySQL to build applications that manage records, control access, and support day-to-day workflows. I can also extend an existing Laravel codebase or connect it to a third-party API.",
    work: "My Laravel experience includes three projects.",
    capabilities: ["Custom Laravel development", "Admin dashboards", "REST API integrations", "MySQL schema and migrations"],
    deliverables: ["Laravel source code", "Database migrations", "Setup and deployment instructions"],
    faq: ["Can you work on an existing Laravel application?", "Yes. I can review the codebase and scope the fixes, features, or integrations it needs."],
    seoTitle: "Laravel Web Development | Abdul Samad",
    description: "Laravel development by Abdul Samad for PHP web applications, MySQL databases, admin dashboards, and REST API integrations.",
  },
  {
    slug: "python-automation-backend-development",
    aliases: ["python-development", "python-automation", "python"],
    title: "Python Automation & Backend Development",
    summary: "I build Python scripts and backend tools to automate repetitive work and connect applications.",
    heading: "Python scripts, data workflows, and APIs",
    body: "I work from sample inputs and expected outputs to build repeatable tasks such as combining CSV files, generating reports, or transferring data between systems. I can also build backend endpoints or small internal tools.",
    work: "My Python development experience includes two projects.",
    capabilities: ["Python scripting", "Excel and CSV processing", "Report automation", "Backend and API integrations"],
    deliverables: ["Python source code", "Dependency list and usage instructions", "Example inputs and outputs where applicable"],
    faq: ["Can you automate a spreadsheet workflow?", "Yes. I can use sample files and your existing steps to define the script’s inputs, rules, and output."],
    seoTitle: "Python Automation & Backend Development | Abdul Samad",
    description: "Python development by Abdul Samad for workflow automation, spreadsheet processing, reporting, and backend API integrations.",
  },
  {
    slug: "asp-net-development",
    aliases: ["asp-net", "asp-net-web-development", "dotnet-development"],
    title: "ASP.NET Development",
    summary: "I build ASP.NET web applications with C# for business workflows and database-backed features.",
    heading: "ASP.NET web applications with C#",
    body: "I can help build or extend web applications that collect, manage, and display business data. I scope the required pages, user roles, and data flows before implementing and testing the features.",
    work: "My ASP.NET experience includes two projects.",
    capabilities: ["ASP.NET web development", "C# application features", "Database-backed forms", "Business dashboards"],
    deliverables: ["ASP.NET source code", "Implemented workflows", "Setup and run instructions"],
    faq: ["Can you extend an existing ASP.NET project?", "Yes. I can review the project’s framework version and code before scoping the update."],
    seoTitle: "ASP.NET & C# Web Development | Abdul Samad",
    description: "ASP.NET development by Abdul Samad for C# web applications, database-backed forms, dashboards, and application updates.",
  },
  {
    slug: "devops-ubuntu-server-setup",
    aliases: ["devops", "devops-server-setup", "ubuntu-server-setup", "devops-deployment"],
    title: "DevOps & Ubuntu Server Setup",
    summary: "I set up Ubuntu servers and help deploy web applications with a documented hosting configuration.",
    heading: "Ubuntu server setup and application deployment",
    body: "I can help configure an Ubuntu server, prepare the application runtime, and set up the routing and HTTPS needed to serve a website. My own hands-on work includes building and configuring an Ubuntu server.",
    capabilities: ["Ubuntu server setup", "Web application deployment", "Reverse proxy and HTTPS configuration", "Environment configuration and deployment documentation"],
    deliverables: ["Configured Ubuntu environment", "Application deployment", "Deployment and maintenance notes"],
    faq: ["Can you deploy an app on my existing VPS?", "Yes. I can review your Ubuntu VPS and determine what the app needs to run there."],
    seoTitle: "DevOps & Ubuntu Server Setup | Abdul Samad",
    description: "Abdul Samad offers Ubuntu VPS setup and web application deployment, including runtime configuration, reverse proxy, and HTTPS.",
  },
  {
    slug: "data-science-with-python",
    aliases: ["data-science", "python-data-science", "data-science-python"],
    title: "Data Science with Python",
    summary: "I use Python to clean datasets, explore patterns, and present findings through charts and reproducible notebooks.",
    heading: "Python data analysis and visualisation",
    body: "I start with the question you want to answer, then organise the data, check missing or inconsistent values, and explore the results. I document the analysis so you can rerun it when new data arrives.",
    capabilities: ["Data cleaning and preparation", "Exploratory data analysis", "Python notebooks", "Charts and data visualisation"],
    deliverables: ["Reproducible Python notebook or script", "Documented data preparation steps", "Charts and findings summary"],
    faq: ["What data formats can I share?", "CSV and Excel files are suitable starting points. I can review your data structure before defining the analysis."],
    seoTitle: "Data Science & Python Data Analysis | Abdul Samad",
    description: "Python data science and analysis by Abdul Samad, including data cleaning, exploratory analysis, visualisation, and reproducible notebooks.",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    summary: "I plan digital marketing for brands, including on-page SEO, social content, and launch messaging.",
    heading: "Brand marketing, SEO, and launch content",
    body: "I organise marketing around the brand’s audience and its next goal, such as improving service-page visibility, planning social content, or preparing a launch. My own brand work covers DUSSU Store, Bibros Solutions, and Bol Hi.",
    capabilities: ["On-page SEO and keyword research", "Social content planning", "Launch and teaser messaging", "Brand positioning"],
    deliverables: ["Keyword and page-content recommendations", "Content plan", "Campaign or launch messaging"],
    faq: ["Can you help market a new brand?", "Yes. I can help define the audience, shape the message, and plan launch content for the website and social channels."],
    seoTitle: "Digital Marketing & On-Page SEO | Abdul Samad",
    description: "Digital marketing by Abdul Samad for brands that need on-page SEO, keyword research, social content planning, and launch messaging.",
  },
];

const processSteps = [
  { title: "Scope", description: "Agree on your goals, inputs, and what you need delivered." },
  { title: "Implement", description: "Complete the agreed work and review it against the brief." },
  { title: "Hand over", description: "Deliver the agreed materials and explain how to use them." },
];

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

async function run() {
  const { MONGODB_URI: uri, MONGODB_DB: databaseName } = process.env;
  if (!uri || !databaseName) {
    console.error("Set MONGODB_URI and MONGODB_DB in the server .env first.");
    process.exitCode = 1;
    return;
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    const database = client.db(databaseName);
    const migration = await database.collection("_schema_migrations")
      .findOne({ _id: "002_application" });
    if (!migration) {
      console.error("This database has no portfolio migration marker. Check MONGODB_DB.");
      process.exitCode = 1;
      return;
    }

    const collection = database.collection("services");
    const existing = await collection.find().toArray();
    const projects = await database.collection("projects")
      .find({ publicationStatus: "published" }, { projection: { title: 1, slug: 1 } }).toArray();
    const now = new Date();
    const plan = [];

    for (const [index, service] of services.entries()) {
      const slugs = [service.slug, ...(service.aliases ?? [])];
      const current = existing.find((item) => item.slug === service.slug)
        ?? existing.find((item) => slugs.includes(item.slug));
      const slug = current?.slug ?? service.slug;
      const matches = new Set((service.projects ?? []).map(normalize));
      const matchedIds = projects.filter((project) =>
        [project.title ?? "", project.slug ?? ""].some((name) => matches.has(normalize(name))))
        .map((project) => project._id);
      const related = new Map([...(current?.relatedProjectIds ?? []), ...matchedIds]
        .map((id) => [String(id), id]));
      const update = {
        title: service.title,
        summary: service.summary,
        content: [
          { type: "heading", level: 2, text: service.heading },
          { type: "paragraph", text: service.body },
          ...(service.work ? [{ type: "paragraph", text: service.work }] : []),
        ],
        capabilities: service.capabilities,
        deliverables: service.deliverables,
        faqs: [{ question: service.faq[0], answer: service.faq[1] }],
        process: processSteps,
        displayOrder: current?.displayOrder ?? 10 + index,
        visible: true,
        publicationStatus: "published",
        publishedAt: current?.publishedAt ?? now,
        updatedAt: now,
        "seo.title": service.seoTitle,
        "seo.description": service.description,
        "seo.noIndex": false,
      };
      if (related.size) update.relatedProjectIds = [...related.values()];
      plan.push({
        slug,
        action: current ? "update" : "create",
        op: { updateOne: {
          filter: { slug },
          update: { $set: update, $setOnInsert: { slug, createdAt: now } },
          upsert: true,
        } },
      });
    }

    if (!process.argv.includes("--preview")) {
      await collection.bulkWrite(plan.map(({ op }) => op));
      const records = await collection.countDocuments({
        slug: { $in: plan.map(({ slug }) => slug) },
        publicationStatus: "published",
        visible: true,
        "seo.noIndex": false,
      });
      if (records !== services.length) throw new Error("Service verification failed.");
      console.log(`Verified ${records} published services in MongoDB.`);
    }

    for (const { action, slug } of plan) console.log(`${action}: /services/${slug}`);
  } catch (error) {
    console.error(`Import stopped (${error.name}${error.code ? " " + error.code : ""}).`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

await run();
