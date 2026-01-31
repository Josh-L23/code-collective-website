const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealTargets = document.querySelectorAll(".reveal");
if (revealTargets.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Array.from(revealTargets).indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 120}ms`;
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        revealTargets.forEach((target) => observer.observe(target));
    } else {
        revealTargets.forEach((target) => target.classList.add("is-visible"));
    }
}

const projectCards = document.querySelectorAll(".project-card");
const shouldToggleOnTap = window.matchMedia("(hover: none)").matches;

const closeOtherCards = (activeCard) => {
    projectCards.forEach((card) => {
        if (card !== activeCard) {
            card.classList.remove("is-flipped");
            card.setAttribute("aria-pressed", "false");
        }
    });
};

projectCards.forEach((card) => {
    const toggleCard = () => {
        const isFlipped = card.classList.toggle("is-flipped");
        card.setAttribute("aria-pressed", String(isFlipped));
        if (isFlipped) {
            closeOtherCards(card);
        }
    };

    card.addEventListener("click", (event) => {
        if (!shouldToggleOnTap) {
            return;
        }
        event.preventDefault();
        toggleCard();
    });

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleCard();
        }
    });
});

document.addEventListener("click", (event) => {
    if (!shouldToggleOnTap) {
        return;
    }
    if (![...projectCards].some((card) => card.contains(event.target))) {
        closeOtherCards();
    }
});

// Contact Form Email Integration
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const businessType = document.getElementById("businessType").value;
        const service = document.getElementById("service").value;

        // Validate required fields
        if (!name || !email || !message) {
            alert("Please fill in all required fields (Name, Email, and Message).");
            return;
        }

        // Create the message payload with additional context
        const fullMessage = `
Business Type: ${businessType || "Not specified"}
Service Interest: ${service || "Not specified"}

Message:
${message}
        `.trim();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        try {
            submitButton.disabled = true;
            submitButton.textContent = "Sending...";

            const response = await fetch(
                "https://codecollective-email-server.vercel.app/send-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: fullMessage,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to send email");
            }

            const result = await response.json();

            // Success message
            alert("Message sent successfully! We'll get back to you soon.");
            contactForm.reset();
            submitButton.textContent = "Message Sent ✓";

            // Reset button after 3 seconds
            setTimeout(() => {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }, 3000);
        } catch (error) {
            console.error("Error sending email:", error);
            alert(
                `Error sending message: ${error.message}. Please try again or contact us on WhatsApp.`
            );
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}
