export const modules = [
  ["Dashboard", "dashboard"],
  ["Profile & Hero", "profile"],
  ["Homepage Sections", "home_sections"],
  ["About & Background", "about"],
  ["Page Content & SEO", "pages"],
  ["Services", "services"],
  ["Skills & Process", "skill_items"],
  ["Projects", "projects"],
  ["Ventures", "ventures"],
  ["Coming Soon", "teasers"],
  ["Blog & Articles", "blog_posts"],
  ["Blog Categories", "blog_categories"],
  ["Media Library", "media"],
  ["Inquiry Inbox", "inquiries"],
  ["Private Notes", "private_notes"],
  ["Navigation & Footer", "navigation"],
  ["Floating Controls", "floating"],
  ["Splash Screen", "splash"],
  ["SEO Settings", "seo"],
  ["Privacy Policy", "privacy"],
  ["Account", "account"],
];

export const settingsViews = {
  profile: [
    "name",
    "roles",
    "heroDescription",
    "aboutDescription",
    "profileImageId",
    "heroPortraitPosition",
    "resumeId",
    "heroMediaType",
    "heroVideoId",
    "email",
    "phone",
    "location",
    "availability",
    "currentRole",
    "stats",
    "socialLinks",
  ],
  navigation: ["navigation", "mobileNavigation", "footerText"],
  floating: ["socialLinks", "floatingControls"],
  splash: ["splash"],
  seo: ["defaultSeo"],
};

export const labels = {
  publicationStatus: "Publication",
  progressStatus: "Progress",
  heroMediaType: "Hero media",
  profileImageId: "Profile image",
  coverId: "Cover image",
  logoId: "Logo",
  resumeId: "Resume PDF",
  mediaId: "Media file",
  featuredTeaserIds: "Featured teasers",
  authorId: "Author",
  categoryIds: "Categories",
  seo: "SEO & social sharing",
  targetId: "Linked item",
  slug: "URL slug",
  content: "Content blocks",
  faqs: "Frequently asked questions",
};

export const label = (k) =>
  labels[k] ||
  k
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

export const refs = {
  mediaId: "media",
  portraitId: "media",
  videoId: "media",
  coverId: "media",
  logoId: "media",
  profileImageId: "media",
  resumeId: "media",
  heroVideoId: "media",
  iconMediaId: "media",
  shareImageId: "media",
  authorId: "admins",
  categoryIds: "blog_categories",
  relatedProjectIds: "projects",
  featuredProjectIds: "projects",
  relatedServiceIds: "services",
  featuredServiceIds: "services",
  featuredVentureIds: "ventures",
  featuredPostIds: "blog_posts",
  relatedPostIds: "blog_posts",
  featuredTeaserIds: "teasers",
};

export const empty = (spec) =>
  spec.bsonType === "object"
    ? {}
    : spec.bsonType === "array"
      ? []
      : spec.bsonType === "bool"
        ? false
        : spec.enum
          ? spec.enum[0]
          : spec.bsonType === "int" || Array.isArray(spec.bsonType)
            ? 0
            : "";

export const normalize = (value) =>
  Array.isArray(value)
    ? value.every((x) => typeof x === "string")
      ? value.map((x) => x.trim()).filter(Boolean)
      : value.map(normalize)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, normalize(v)]),
        )
      : value;
