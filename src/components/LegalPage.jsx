import React from "react";

const pages = {
  privacy: {
    title: "Privacy Policy",
    updated: "June 28, 2026",
    intro:
      "This portfolio uses analytics to understand visits and improve the site. It only collects limited visitor and interaction data.",
    sections: [
      {
        title: "Data collected",
        body:
          "The site may collect anonymous visitor IDs, session IDs, page and section views, device type, browser, referrer, language, screen size, timezone, and interaction events such as contact clicks or CV downloads.",
      },
      {
        title: "Facebook profile consent",
        body:
          "If a visitor arrives from Facebook, the site may ask for permission to receive the visitor's Facebook display name and profile photo. This data is only collected after the visitor chooses to allow it.",
      },
      {
        title: "How data is used",
        body:
          "Data is used only by the portfolio owner to understand portfolio traffic, identify interested visitors who consented, and improve the portfolio experience.",
      },
      {
        title: "Contact",
        body:
          "For privacy questions or deletion requests, contact vudinhphong.26.12.2001@gmail.com.",
      },
    ],
  },
  "data-deletion": {
    title: "User Data Deletion",
    updated: "June 28, 2026",
    intro:
      "Visitors can request deletion of profile or analytics data collected by this portfolio.",
    sections: [
      {
        title: "How to request deletion",
        body:
          "Send an email to vudinhphong.26.12.2001@gmail.com with the subject 'Portfolio data deletion request'. Include your Facebook display name and, if possible, the date and approximate time you visited the portfolio.",
      },
      {
        title: "What will be deleted",
        body:
          "The portfolio owner will delete matching visitor profile records, profile consent records, sessions, and events from Firebase Firestore where reasonably identifiable.",
      },
      {
        title: "Processing time",
        body:
          "Deletion requests are reviewed and processed as soon as possible, normally within 7 business days.",
      },
    ],
  },
};

function LegalPage({ page }) {
  const content = pages[page] || pages.privacy;

  return (
    <main className="legal-page">
      <section className="legal-panel">
        <a className="legal-back" href="/">
          Back to portfolio
        </a>
        <span className="admin-kicker">Portfolio policy</span>
        <h1>{content.title}</h1>
        <p className="legal-updated">Last updated: {content.updated}</p>
        <p className="legal-intro">{content.intro}</p>

        <div className="legal-sections">
          {content.sections.map((section) => (
            <article key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LegalPage;
