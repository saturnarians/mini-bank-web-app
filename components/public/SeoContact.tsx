"use client"
import React, { useState } from "react";
import Meta from "./Meta";

export default function SeoContact() {
  const [sent, setSent] = useState(false);

  return (
    <Meta title="Contact — westinLand Bank" description="Contact westinLand Bank for support, questions, or business inquiries.">
      <section aria-label="Contact westinLand Bank" id="contact" style={{ padding: "2.5rem 1rem" }}>
        <div className="pl-container">
          <div style={{ maxWidth: 720 }}>
            <h2>Contact us</h2>
            <p className="fade-in visible">Have questions? Send us a message and we will reply shortly.</p>
            {!sent ? (
              <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <input name="name" placeholder="Your name" required />
                <input name="email" type="email" placeholder="Your email" required />
                <textarea name="message" rows={6} placeholder="Message" required />
                <div>
                  <button className="pl-btn" type="submit">Send message</button>
                </div>
              </form>
            ) : (
              <div className="fade-in visible">
                <p>Thanks — we received your message and will be in touch.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Meta>
  );
}
