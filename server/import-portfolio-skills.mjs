import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";
import { models } from "./models/index.js";

const skills = [
  {
    title: "WordPress & WooCommerce",
    aliases: ["WordPress Development"],
    category: "Web Development",
    description: "I build responsive WordPress websites and WooCommerce stores with Elementor, from page layouts to product and checkout setup.",
  },
  {
    title: "MERN Stack Development",
    aliases: ["React & Frontend Development", "Node.js, Express & MongoDB"],
    category: "Full-Stack Development",
    description: "I build full-stack web applications with MongoDB, Express.js, React, and Node.js, including REST APIs, storefronts, and admin dashboards.",
  },
  {
    title: "Flutter App Development",
    category: "Mobile Development",
    description: "I build cross-platform mobile interfaces with Flutter and Dart, including navigation, forms, and API integration.",
  },
  {
    title: "Laravel & PHP",
    aliases: ["Laravel Web Development"],
    category: "Backend Development",
    description: "I build PHP web applications with Laravel, including database-backed features, form validation, and REST APIs.",
  },
  {
    title: "ASP.NET & C#",
    aliases: ["ASP.NET Development"],
    category: "Backend Development",
    description: "I build web applications with ASP.NET and C#, including server-side features, forms, and database integration.",
  },
  {
    title: "Python Automation & Backend Development",
    category: "Automation",
    description: "I write Python scripts to automate repetitive tasks and build backend workflows for processing data and connecting APIs.",
  },
  {
    title: "DevOps & Ubuntu Server Setup",
    category: "Server Administration",
    description: "I set up Ubuntu servers and configure runtime environments for web applications.",
  },
  {
    title: "Data Science with Python",
    category: "Data Science",
    description: "I clean and analyze datasets, explore patterns, and present findings through charts and reproducible notebooks.",
  },
  {
    title: "Digital Marketing & SEO",
    aliases: ["Digital Marketing"],
    category: "Digital Marketing",
    description: "I plan on-page SEO, social content, and launch messaging around the audience and goals of each website.",
  },
  {
    title: "Website Deployment, Hosting & Domain Setup",
    aliases: ["Deployment & Technical SEO"],
    category: "Hosting & Deployment",
    description: "I deploy websites and web applications on Vercel, Render, and Hostinger. I connect custom domains, configure DNS records and HTTPS, and verify that the live site works on the correct domain.",
  },
];

const group = "skills";
const Skill = models.skill_items;
const normalize = (title) => title.trim().toLowerCase();

try {
  await connectDatabase();
  console.log(`Database: ${mongoose.connection.name}`);

  const existing = await Skill.find({ group })
    .select("_id title")
    .sort({ _id: 1 })
    .lean();

  let added = 0;
  let updated = 0;
  const extraMatches = [];

  for (const [index, skill] of skills.entries()) {
    const { aliases = [], ...fields } = skill;
    const titles = [skill.title, ...aliases].map(normalize);
    const matches = existing.filter((record) =>
      titles.includes(normalize(record.title)),
    );
    const match =
      matches.find((record) => normalize(record.title) === titles[0]) ??
      matches[0];

    const filter = match
      ? { _id: match._id, group }
      : { title: skill.title, group };

    const result = await Skill.updateOne(
      filter,
      { $set: { ...fields, group, displayOrder: index + 1, visible: true } },
      { upsert: !match, runValidators: true },
    );

    if (!result.matchedCount && !result.upsertedCount) {
      throw new Error(`Skill changed during import: ${skill.title}. Run the import again.`);
    }

    added += result.upsertedCount;
    updated += result.matchedCount;
    extraMatches.push(
      ...matches.filter((record) => record !== match).map((record) => record.title),
    );
  }

  console.log(`Skills: ${added} added, ${updated} matched and updated.`);
  if (extraMatches.length) {
    console.log(`Other matching records kept: ${extraMatches.join(", ")}`);
  }
} catch (error) {
  console.error(`Skill import stopped: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}