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
