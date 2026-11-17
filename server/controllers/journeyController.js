import { createHash } from "node:crypto";
import { SkillItem } from "../models/index.js";

const group = "beyond_code";
const starters = [
  {
    title: "Bibros Solutions",
    category: "Founder",
    iconKey: "founder",
    description: "I founded Bibros Solutions, my web design and development agency. I build WordPress sites, online stores, and custom web applications for businesses.",
  },
  {
    title: "DUSSU Store",
    category: "Brand",
    iconKey: "brand",
    description: "I founded DUSSU Store, a Karachi streetwear brand built around “Wear Your Difference.” I also built its MERN storefront, including collection browsing and cash-on-delivery checkout.",
  },
  {
    title: "Web Developer",
    category: "Work",
    iconKey: "work",
    description: "I build business websites and online stores with WordPress and WooCommerce. My client projects include a WordPress site for Naveed & Umer Builders and a custom MERN storefront for Farmeri.",
  },
  {
    title: "Flutter Development",
    category: "Mobile",
    iconKey: "mobile",
    description: "I build cross-platform mobile interfaces for Android and iOS with Flutter and Dart, including navigation, forms, and API integration.",
  },
  {
    title: "Building Bol Hi",
    category: "Next",
    iconKey: "next",
    description: "I’m building Bol Hi, an upcoming messaging app designed to make everyday conversations easier.",
  },
];

export async function importJourneyChapters(_req, res) {
  const existing = await SkillItem.find({ group }).select("title displayOrder").lean();
  const titles = new Set(existing.map(({ title }) => title.trim().toLowerCase()));
  const firstOrder = existing.reduce((max, row) => Math.max(max, row.displayOrder), -1) + 1;
  let added = 0;

  for (const [index, chapter] of starters.entries()) {
    if (titles.has(chapter.title.toLowerCase())) continue;

    const _id = createHash("sha256")
      .update("portfolio:beyond-code:" + chapter.iconKey)
      .digest("hex").slice(0, 24);
    const now = new Date();
    const result = await SkillItem.updateOne(
      { _id },
      {
        $setOnInsert: {
          ...chapter,
          group,
          displayOrder: firstOrder + index,
          visible: true,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true, runValidators: true, timestamps: false },
    );
    added += result.upsertedCount;
  }

  return res.json({ added, skipped: starters.length - added });
}
