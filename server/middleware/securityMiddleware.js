import helmet from "helmet";
export function securityHeaders(production) {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        styleSrcAttr: ["'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'"],
        frameSrc: ["https://www.youtube-nocookie.com"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: production ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: production ? undefined : false,
  });
}
export const privatePageHeaders = (req, res, next) => {
  if (req.query.preview || req.path.startsWith("/admin"))
    res.set({
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    });
  next();
};
export const noStore = (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};
