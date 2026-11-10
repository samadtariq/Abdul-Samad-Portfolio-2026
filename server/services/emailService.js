export async function notifyInquiry(doc) {
  if (
    process.env.SMTP_HOST &&
    process.env.NOTIFY_EMAIL &&
    process.env.SMTP_FROM
  ) {
    try {
      const { default: nodemailer } = await import("nodemailer");
      await nodemailer
        .createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_PORT === "465",
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        })
        .sendMail({
          from: process.env.SMTP_FROM,
          to: process.env.NOTIFY_EMAIL,
          replyTo: doc.email,
          subject: "New portfolio inquiry",
          text: `${doc.name}\n${doc.message}`,
        });
    } catch {
      console.error("Optional inquiry email failed; inquiry is saved.");
    }
  }
}
