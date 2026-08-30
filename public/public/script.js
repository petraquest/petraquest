// Petra Quest — site interactions

document.addEventListener("DOMContentLoaded", () => {

  // Smooth navigation
  document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

      const targetId = link.getAttribute("href");

      if (targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  // Simple reveal animation
  const revealElements = document.querySelectorAll(
    ".section, .capability, .work-card, .insights-list article"
  );

  const observer = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12
    }
  );


  revealElements.forEach(element => {
    element.classList.add("reveal");
    observer.observe(element);
  });

});
