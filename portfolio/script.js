/* --------------------------------------------------
   Theme toggle (light / dark) — remembers the choice
-------------------------------------------------- */
(function initThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  // Keep the button's label and pressed state in sync with the theme.
  function syncToggleLabel() {
    const isDark = root.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  syncToggleLabel();

  toggle.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nextTheme);

    try {
      localStorage.setItem("theme", nextTheme);
    } catch (error) {
      // Storage can be blocked (private mode); the theme still changes for this visit.
    }

    syncToggleLabel();
  });
})();

/* --------------------------------------------------
   Greeting based on local time
-------------------------------------------------- */
(function initGreeting() {
  const target = document.getElementById("greeting");
  if (!target) return;

  function buildGreeting(date) {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) return "Good morning — thanks for stopping by.";
    if (hour >= 12 && hour < 17) return "Good afternoon — thanks for stopping by.";
    if (hour >= 17 && hour < 22) return "Good evening — thanks for stopping by.";
    return "Good night — thanks for stopping by.";
  }

  function render() {
    target.textContent = buildGreeting(new Date());
  }

  render();
  // Refresh once a minute so the text stays correct on a long visit.
  setInterval(render, 60 * 1000);
})();

/* --------------------------------------------------
   Footer year
-------------------------------------------------- */
(function initYear() {
  const target = document.getElementById("current-year");
  if (target) {
    target.textContent = String(new Date().getFullYear());
  }
})();

/* --------------------------------------------------
   Contact form with live validation
-------------------------------------------------- */
(function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: {
      input: document.getElementById("name"),
      error: document.getElementById("name-error"),
      problem: "Please tell me your name."
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("email-error"),
      problem: "That email doesn't look right — please check it."
    },
    message: {
      input: document.getElementById("message"),
      error: document.getElementById("message-error"),
      problem: "Please add a little more detail (at least 10 characters)."
    }
  };

  const status = document.getElementById("form-status");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Check one field and show or clear its message.
  function validateField(key) {
    const field = fields[key];
    const value = field.input.value.trim();
    let problem = "";

    if (key === "name" && value.length < 2) {
      problem = field.problem;
    } else if (key === "email" && !emailPattern.test(value)) {
      problem = field.problem;
    } else if (key === "message" && value.length < 10) {
      problem = field.problem;
    }

    field.error.textContent = problem;
    field.input.setAttribute("aria-invalid", problem ? "true" : "false");
    return problem === "";
  }

  // Validate as the visitor types, once they have left the field.
  for (const key of Object.keys(fields)) {
    const field = fields[key];

    field.input.addEventListener("blur", () => validateField(key));

    field.input.addEventListener("input", () => {
      if (field.error.textContent) validateField(key);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    const keys = Object.keys(fields);
    const results = keys.map((key) => validateField(key));
    const firstInvalidIndex = results.indexOf(false);

    if (firstInvalidIndex !== -1) {
      fields[keys[firstInvalidIndex]].input.focus();
      return;
    }

    // No server is connected yet, so confirm locally and point to social profiles.
    status.textContent =
      `Thanks, ${fields.name.input.value.trim()}. This form is not connected to a mail service yet — ` +
      "please reach me on LinkedIn or Instagram in the meantime.";

    form.reset();
    for (const key of keys) {
      fields[key].input.setAttribute("aria-invalid", "false");
      fields[key].error.textContent = "";
    }
  });
})();
