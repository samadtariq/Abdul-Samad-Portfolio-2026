import Admin from "./Admin.js";
import AdminSession from "./AdminSession.js";
import PortfolioSetting from "./PortfolioSetting.js";
import Page from "./Page.js";
import HomeSection from "./HomeSection.js";
import Service from "./Service.js";
import SkillItem from "./SkillItem.js";
import Project from "./Project.js";
import Venture from "./Venture.js";
import Teaser from "./Teaser.js";
import PrivateNote from "./PrivateNote.js";
import Media from "./Media.js";
import BlogCategory from "./BlogCategory.js";
import BlogPost from "./BlogPost.js";
import Inquiry from "./Inquiry.js";
import AuditLog from "./AuditLog.js";

export {
  Admin,
  AdminSession,
  PortfolioSetting,
  Page,
  HomeSection,
  Service,
  SkillItem,
  Project,
  Venture,
  Teaser,
  PrivateNote,
  Media,
  BlogCategory,
  BlogPost,
  Inquiry,
  AuditLog,
};
export const models = {
  admins: Admin,
  admin_sessions: AdminSession,
  portfolio_settings: PortfolioSetting,
  pages: Page,
  home_sections: HomeSection,
  services: Service,
  skill_items: SkillItem,
  projects: Project,
  ventures: Venture,
  teasers: Teaser,
  private_notes: PrivateNote,
  media: Media,
  blog_categories: BlogCategory,
  blog_posts: BlogPost,
  inquiries: Inquiry,
  audit_logs: AuditLog,
};
