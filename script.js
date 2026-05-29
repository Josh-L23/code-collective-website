/* ============================================
   CODE COLLECTIVE — script.js
   ============================================ */

// ─── CURSOR GLOW ─────────────────────────────
const cursorGlow = document.getElementById("cursorGlow");
if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
        cursorGlow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    });
}

// ─── HEADER SCROLL SHADOW ─────────────────────
const siteHeader = document.getElementById("siteHeader");
if (siteHeader) {
    const onScroll = () => {
        siteHeader.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
}

// ─── MOBILE NAV ──────────────────────────────
const hamburger = document.getElementById("navHamburger");
const mobileMenu = document.getElementById("mobileMenu");
if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
        const open = hamburger.classList.toggle("open");
        mobileMenu.classList.toggle("open", open);
        hamburger.setAttribute("aria-expanded", String(open));
        mobileMenu.setAttribute("aria-hidden", String(!open));
    });

    // Close on link click
    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("open");
            mobileMenu.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
            mobileMenu.setAttribute("aria-hidden", "true");
        });
    });
}

// ─── REVEAL ON SCROLL ─────────────────────────
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(".reveal");

if (revealTargets.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        revealTargets.forEach((el) => revealObserver.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add("is-visible"));
    }
}

// ─── PROJECT CARD TAP-TO-REVEAL (MOBILE) ─────
const projCards = document.querySelectorAll(".proj-card");
const isTouchDevice = window.matchMedia("(hover: none)").matches;

if (isTouchDevice) {
    projCards.forEach((card) => {
        card.addEventListener("click", () => {
            const isActive = card.classList.toggle("touch-active");
            card.setAttribute("aria-pressed", String(isActive));
            // Close others
            projCards.forEach((other) => {
                if (other !== card) {
                    other.classList.remove("touch-active");
                    other.setAttribute("aria-pressed", "false");
                }
            });
        });
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Add touch-active CSS
    const style = document.createElement("style");
    style.textContent = `
        .proj-card.touch-active .proj-meta { opacity: 0; pointer-events: none; }
        .proj-card.touch-active .proj-img-wrap img { transform: scale(1.07); filter: brightness(0.4) saturate(0.7); }
    `;
    document.head.appendChild(style);

    document.addEventListener("click", (e) => {
        if (![...projCards].some((c) => c.contains(e.target))) {
            projCards.forEach((c) => {
                c.classList.remove("touch-active");
                c.setAttribute("aria-pressed", "false");
            });
        }
    });
}

// ─── CONTACT FORM ─────────────────────────────
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const businessType = document.getElementById("businessType").value;
        const service = document.getElementById("service").value;

        if (!name || !email || !message) {
            showFormFeedback("Please fill in your name, email, and message.", "error");
            return;
        }

        const fullMessage = [
            businessType && `Business Type: ${businessType}`,
            service && `Service: ${service}`,
            "",
            message,
        ].filter(Boolean).join("\n");

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";

        try {
            const response = await fetch(
                "https://codecollective-email-server.vercel.app/send-email",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, message: fullMessage }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || "Server error");
            }

            showFormFeedback("Message sent! We'll be in touch soon. ✦", "success");
            contactForm.reset();
            submitBtn.textContent = "Sent ✓";
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 4000);
        } catch (err) {
            console.error(err);
            showFormFeedback(
                `Couldn't send the message (${err.message}). Try WhatsApp instead!`,
                "error"
            );
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

function showFormFeedback(text, type) {
    let fb = document.getElementById("form-feedback");
    if (!fb) {
        fb = document.createElement("p");
        fb.id = "form-feedback";
        fb.style.cssText = `
            padding: 0.85rem 1.1rem;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 500;
            margin-top: 0.5rem;
        `;
        contactForm.appendChild(fb);
    }
    fb.textContent = text;
    fb.style.background = type === "success"
        ? "rgba(0,158,96,0.2)"
        : "rgba(220,50,50,0.2)";
    fb.style.color = type === "success" ? "#00b36e" : "#ff6b6b";
    fb.style.border = `1px solid ${type === "success" ? "rgba(0,158,96,0.3)" : "rgba(220,50,50,0.3)"}`;
}