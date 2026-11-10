import React from "react";
import { resolvePage } from "./utils/resolvePage.js";
import { Home } from "./pages/HomePage.jsx";
import { About } from "./pages/AboutPage.jsx";
import { Detail } from "./pages/DetailPage.jsx";
import { Listing } from "./pages/ListingPage.jsx";
import { ContactPage } from "./pages/ContactPage.jsx";
import { PrivacyPage } from "./pages/PrivacyPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { Header } from "./components/layout/Header.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import { Floating } from "./components/layout/FloatingControls.jsx";
import { Splash } from "./components/layout/Splash.jsx";

export function Site({ data }) {
  const page = resolvePage(data);
  let body;
  if (page.type === "home") body = <Home data={data} />;
  else if (page.type === "about")
    body = <About data={data} record={page.record} />;
  else if (page.type === "detail") body = <Detail page={page} data={data} />;
  else if (
    ["services", "projects", "ventures", "blog", "teasers"].includes(page.type)
  )
    body = (
      <Listing
        data={data}
        collection={page.type === "blog" ? "blog_posts" : page.type}
        title={page.title}
        label="ABDUL SAMAD / PORTFOLIO"
      />
    );
  else if (page.type === "contact")
    body = <ContactPage data={data} page={page} />;
  else if (page.type === "privacy")
    body = <PrivacyPage data={data} page={page} />;
  else body = <NotFoundPage data={data} page={page} />;
  return (
    <>
      <Header settings={data.settings} path={data.path} />
      {data.preview && (
        <div className="preview-banner">
          Private draft preview — visible to signed-in admin only.
        </div>
      )}
      <main id="main" className="container">
        {body}
      </main>
      <Footer data={data} />
      <Floating data={data} />
      <Splash settings={data.settings} />
    </>
  );
}

export default Site;
