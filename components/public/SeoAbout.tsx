"use client"
import React from "react";
// import Accordion from "./Accordion";
import Meta from "./Meta";

const items = [
  { title: "Our mission", content: <p>We provide trusted financial services that empower customers.</p> },
  { title: "Security", content: <p>Bank-grade encryption and continuous monitoring protect your accounts.</p> },
  { title: "Community", content: <p>We support local initiatives and small business growth.</p> },
];

export default function SeoAbout() {
  return (
    <Meta title="About — westinLand Bank" description="Learn about westinLand Bank's mission, security, and community focus.">
      <section aria-label="About westinLand Bank" id="about" style={{ padding: "2.5rem 1rem" }}>
        <div className="pl-container">
          <div style={{ maxWidth: 860 }}>
            <h2>About westinLand Bank</h2>
            <p className="fade-in visible">Founded to serve people and businesses with thoughtful banking products.</p>
            <div style={{ marginTop: "1rem" }}>
            </div>
          </div>
        </div>
      </section>
    </Meta>
  );
}
