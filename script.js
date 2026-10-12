// ===== Site config — change your contact email here =====
const CONTACT_EMAIL = "afradenterprise@gmail.com";

// Footer year
document.querySelectorAll("#year").forEach(el => (el.textContent = new Date().getFullYear()));

// Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if (menuBtn) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
}

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Contact page
const emailLink = document.getElementById("email-link");
if (emailLink) { emailLink.href = "mailto:" + CONTACT_EMAIL; emailLink.textContent = CONTACT_EMAIL; }

const form = document.getElementById("contact-form");
if (form) {
  const statusEl = document.getElementById("form-status");
  const btn = form.querySelector('button[type="submit"]');
  const showStatus = (msg, ok) => {
    statusEl.textContent = msg;
    statusEl.style.color = ok ? "var(--accent-2)" : "#c0392b";
    statusEl.style.display = "block";
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const d = new FormData(form);
    if (d.get("_honey")) return; // spam bot filled the hidden field
    const name = (d.get("name") || "").trim();
    const email = (d.get("email") || "").trim();
    const message = (d.get("message") || "").trim();
    if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
      showStatus("Please fill in your name, a valid email, and project details.", false);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New website inquiry — ${name}`,
          _replyto: email,
          _template: "table",
          _captcha: "false",
          Name: name,
          Email: email,
          Company: d.get("company") || "-",
          Budget: d.get("budget"),
          Services: d.getAll("service").join(", ") || "Not specified",
          Message: message
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === "false") throw new Error(data.message || "Send failed");
      form.reset();
      showStatus("Thanks! Your message was sent — we'll reply within 24 hours.", true);
    } catch (err) {
      showStatus("Sorry, something went wrong. Please call, text or WhatsApp (813) 504-4622, or email " + CONTACT_EMAIL + ".", false);
    } finally {
      btn.disabled = false;
      btn.textContent = "Send message →";
    }
  });
}
