/* ============================================
   Portfolio — Interactive UX Layer
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- AUTO-HIDE NAV ---------- */
  const header = document.querySelector(".site-header");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    if (!header) return;
    const current = window.pageYOffset;
    if (current > lastScroll && current > 120) {
      header.style.transform = "translateY(-100%)";
      header.style.transition = "transform 0.3s ease";
    } else {
      header.style.transform = "translateY(0)";
    }
    lastScroll = current <= 0 ? 0 : current;
  }, { passive: true });

  /* ---------- ACTIVE SECTION HIGHLIGHT ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".main-nav a[href^=\

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const isActive = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("active", isActive);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(s => observer.observe(s));
  }

  /* ---------- SMOOTH SCROLL WITH OFFSET ---------- */
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "#top") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ---------- COPY EMAIL BUTTON ---------- */
  const copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email || "wayne.kamachetera@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        const strong = copyBtn.querySelector("strong");
        if (strong) {
          const original = strong.textContent;
          strong.textContent = "Email Copied ✓";
          strong.style.color = "#22c55e";
          setTimeout(() => {
            strong.textContent = original;
            strong.style.color = "";
          }, 1800);
        }
      } catch (err) {
        window.location.href = "mailto:" + email;
      }
    });
  }

  /* ---------- BACK TO TOP BUTTON ---------- */
  const backToTop = document.createElement("button");
  backToTop.id = "backToTop";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = "↑";
  backToTop.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 22px;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1677ff, #0a5cc7);
    color: white;
    border: none;
    font-size: 1.3rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(22,119,255,0.35);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s, transform 0.2s;
    z-index: 40;
  `;
  document.body.appendChild(backToTop);

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 500) {
      backToTop.style.opacity = "1";
      backToTop.style.visibility = "visible";
    } else {
      backToTop.style.opacity = "0";
      backToTop.style.visibility = "hidden";
    }
  }, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});