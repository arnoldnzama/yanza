// Données simulées (en production, récupérées via API sécurisée)
const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Préparateur de commandes H/F",
    company: "Logisprint",
    location: "Lyon, France",
    country: "France",
    contract: "interim",
    sector: "Logistique",
    salary: 1900,
    durationMonths: 3,
    startDate: "2026-02-01",
    publishedAt: "2026-01-05",
    description:
      "Vous rejoignez une équipe dynamique au sein d’un entrepôt moderne. Missions : préparation de commandes, gestion des stocks, contrôle qualité. Profil : rigoureux·se, organisé·e, à l’aise avec le travail d’équipe. Horaires en 2x8.",
  },
  {
    id: "job-2",
    title: "Développeur Front-end React",
    company: "DigitalWave",
    location: "Remote, France",
    country: "France",
    contract: "mission",
    sector: "IT & Digital",
    salary: 3500,
    durationMonths: 6,
    startDate: "2026-01-20",
    publishedAt: "2026-01-03",
    description:
      "Dans une équipe produit agile, vous contribuez au développement de nouvelles interfaces clients en React. Bonnes pratiques UX/UI, intégration API REST, tests unitaires requis. Environnement 100% remote.",
  },
  {
    id: "job-3",
    title: "Technicien de maintenance industrielle",
    company: "IndusTech",
    location: "Tanger, Maroc",
    country: "Maroc",
    contract: "interim",
    sector: "Industrie",
    salary: 2200,
    durationMonths: 12,
    startDate: "2026-02-15",
    publishedAt: "2025-12-28",
    description:
      "Vous assurez la maintenance préventive et curative de lignes de production automatisées. Compétences en électricité/automatisme appréciées. Astreintes possibles le week-end.",
  },
  {
    id: "job-4",
    title: "Agent d’accueil bilingue",
    company: "Airport Services",
    location: "Bruxelles, Belgique",
    country: "Belgique",
    contract: "cdd",
    sector: "Services",
    salary: 2100,
    durationMonths: 4,
    startDate: "2026-01-25",
    publishedAt: "2025-12-30",
    description:
      "Accueil et orientation des passagers, gestion des informations vols, accompagnement des passagers à mobilité réduite. Niveau B2 en anglais minimum.",
  },
  {
    id: "job-5",
    title: "Ouvrier BTP polyvalent",
    company: "BâtirPlus",
    location: "Paris, France",
    country: "France",
    contract: "interim",
    sector: "BTP",
    salary: 2000,
    durationMonths: 2,
    startDate: "2026-01-18",
    publishedAt: "2026-01-02",
    description:
      "Chantiers de rénovation et construction neuve. Aide aux maçons et chefs de chantier, manutention, mise en sécurité. Missions variées avec possibilité de prolongation.",
  },
];

const MOCK_TESTIMONIALS = [
  {
    quote:
      "Grâce à Yanza Intérim, j’ai pu enchaîner plusieurs missions dans la logistique en quelques semaines seulement.",
    name: "Mariam",
    role: "Candidat intérimaire - Logistique",
  },
  {
    quote:
      "La centralisation des candidatures et le tri par compétences nous font gagner un temps précieux.",
    name: "Thomas",
    role: "Responsable d’agence d’intérim",
  },
  {
    quote:
      "Interface claire, publication rapide, et des profils qualifiés pour nos besoins en IT.",
    name: "Julie",
    role: "Talent Acquisition - ESN",
  },
];

const MOCK_PARTNERS = [
  "EuroLog Groupe",
  "Talent IT",
  "Global Interim",
  "BTP & Co",
  "Services+ RH",
];

const POPULAR_SECTORS = [
  "Logistique & Transport",
  "IT & Digital",
  "BTP",
  "Industrie",
  "Services",
  "Finance & Banque",
  "Hôtellerie & Restauration",
];

const JOBS_PER_PAGE = 4;

const state = {
  jobs: [...MOCK_JOBS],
  filters: {
    keyword: "",
    location: "",
    duration: "",
    salaryMin: "",
    published: "",
  },
  sort: "newest",
  currentPage: 1,
  currentJobId: null,
  recruiterJobs: [],
};

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}
function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function formatCurrency(value) {
  if (!value && value !== 0) return "Non précisé";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  if (!value) return "Non précisé";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function daysSince(dateStr) {
  const diff =
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

function init() {
  initNavigation();
  initHomeData();
  initJobListing();
  initRecruiterSection();
  initAdminView();
  initApplyModal();
  const yearSpan = qs("#current-year");
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
}

function initNavigation() {
  const views = {
    home: qs("#home-view"),
    jobs: qs("#jobs-view"),
    jobDetail: qs("#job-detail-view"),
    recruiter: qs("#recruiter-view"),
    admin: qs("#admin-view"),
  };

  function showView(name) {
    Object.values(views).forEach((el) => {
      if (!el) return;
      const isTarget =
        (name === "jobDetail" && el === views.jobDetail) ||
        (name !== "jobDetail" && el === views[name]);
      el.hidden = !isTarget;
      el.classList.toggle("is-active", isTarget);
    });
    const main = qs("#app");
    if (main) main.focus();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const viewBtn = target.closest("[data-view]");
    if (viewBtn) {
      const viewName = viewBtn.getAttribute("data-view");
      if (!viewName) return;
      event.preventDefault();
      if (viewName === "jobs") {
        state.currentPage = 1;
        renderJobListing();
      }
      showView(
        viewName === "job-detail" || viewName === "jobDetail"
          ? "jobDetail"
          : viewName
      );
      const nav = qs(".main-nav");
      nav?.classList.remove("is-open");
      const toggle = qs(".nav-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  });

  const navToggle = qs(".nav-toggle");
  const mainNav = qs(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const searchForm = qs("#global-search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(searchForm);
      state.filters.keyword = (data.get("keyword") || "").toString();
      state.filters.location = (data.get("location") || "").toString();
      state.filters.contract = (data.get("contract") || "").toString();
      state.currentPage = 1;
      renderJobListing();
      showView("jobs");
    });
  }
}

function initHomeData() {
  const recentJobsContainer = qs("#recent-jobs");
  if (recentJobsContainer) {
    const recentJobs = [...state.jobs]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 3);
    recentJobsContainer.innerHTML = recentJobs
      .map((job) => createJobCardHTML(job, true))
      .join("");
  }

  const sectorsContainer = qs("#popular-sectors");
  if (sectorsContainer) {
    sectorsContainer.innerHTML = POPULAR_SECTORS.map(
      (s, index) =>
        `<button class="chip" data-variant="${
          index < 3 ? "highlight" : ""
        }" type="button">${s}</button>`
    ).join("");
  }

  const testimonialsContainer = qs("#testimonials");
  if (testimonialsContainer) {
    testimonialsContainer.innerHTML = MOCK_TESTIMONIALS.map(
      (t) => `
        <article class="card testimonial">
          <p class="testimonial-quote">“${t.quote}”</p>
          <p class="testimonial-name">${t.name}</p>
          <p class="testimonial-role">${t.role}</p>
        </article>
      `
    ).join("");
  }

  const partnersContainer = qs("#partners");
  if (partnersContainer) {
    partnersContainer.innerHTML = MOCK_PARTNERS.map(
      (p) => `<div class="partner">${p}</div>`
    ).join("");
  }
}

function applyFiltersAndSort() {
  let jobs = [...state.jobs];
  const { keyword, location, duration, salaryMin, published } = state.filters;

  if (keyword) {
    const kw = keyword.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(kw) ||
        job.company.toLowerCase().includes(kw) ||
        (job.sector && job.sector.toLowerCase().includes(kw))
    );
  }
  if (location) {
    const loc = location.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.location.toLowerCase().includes(loc) ||
        job.country.toLowerCase().includes(loc)
    );
  }
  if (duration) {
    jobs = jobs.filter((job) => {
      const d = job.durationMonths || 0;
      if (duration === "1-3") return d <= 3;
      if (duration === "3-6") return d > 3 && d <= 6;
      if (duration === "6+") return d > 6;
      return true;
    });
  }
  if (salaryMin) {
    const min = Number(salaryMin);
    jobs = jobs.filter((job) => (job.salary || 0) >= min);
  }
  if (published) {
    jobs = jobs.filter((job) => {
      const days = daysSince(job.publishedAt);
      if (published === "24h") return days <= 1;
      if (published === "7d") return days <= 7;
      if (published === "30d") return days <= 30;
      return true;
    });
  }

  jobs.sort((a, b) => {
    if (state.sort === "salary-desc") {
      return (b.salary || 0) - (a.salary || 0);
    }
    if (state.sort === "salary-asc") {
      return (a.salary || 0) - (b.salary || 0);
    }
    return (
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
    );
  });

  return jobs;
}

function createJobCardHTML(job, compact = false) {
  const days = daysSince(job.publishedAt);
  const isNew = days <= 7;
  const durationText = job.durationMonths
    ? `${job.durationMonths} mois`
    : "Durée non précisée";

  return `
    <article class="card job-card" data-job-id="${job.id}" tabindex="0">
      <div class="job-card-header">
        <div>
          <h3 class="card-title">${job.title}</h3>
          <p class="card-subtitle">${job.company}</p>
        </div>
        <div class="job-badges">
          ${
            isNew
              ? '<span class="badge primary">Nouveau</span>'
              : ""
          }
          <span class="badge">${
            job.contract === "interim"
              ? "Intérim"
              : job.contract === "cdd"
              ? "CDD"
              : "Mission courte"
          }</span>
        </div>
      </div>
      <p class="card-text">${job.location} • ${durationText}</p>
      ${
        !compact
          ? `<p class="card-text">${formatCurrency(
              job.salary
            )} / mois • Publiée le ${formatDate(job.publishedAt)}</p>`
          : ""
      }
      <div class="job-meta">
        <span>${job.sector || "Secteur non précisé"}</span>
        <span>${formatCurrency(job.salary)} / mois</span>
        <span>Début ${formatDate(job.startDate)}</span>
      </div>
    </article>
  `;
}

function initJobListing() {
  const filtersForm = qs("#job-filters");
  const resetBtn = qs("#reset-filters");
  const sortSelect = qs("#sort-select");

  if (filtersForm) {
    filtersForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(filtersForm);
      state.filters.keyword = (data.get("keyword") || "").toString();
      state.filters.location = (data.get("location") || "").toString();
      state.filters.duration = (data.get("duration") || "").toString();
      state.filters.salaryMin = (data.get("salaryMin") || "").toString();
      state.filters.published = (data.get("published") || "").toString();
      state.currentPage = 1;
      renderJobListing();
    });
  }

  if (resetBtn && filtersForm) {
    resetBtn.addEventListener("click", () => {
      filtersForm.reset();
      state.filters = {
        keyword: "",
        location: "",
        duration: "",
        salaryMin: "",
        published: "",
      };
      state.currentPage = 1;
      renderJobListing();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      state.currentPage = 1;
      renderJobListing();
    });
  }

  const listContainer = qs("#jobs-list");
  if (listContainer) {
    listContainer.addEventListener("click", handleJobCardActivate);
    listContainer.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        handleJobCardActivate(e);
      }
    });
  }

  renderJobListing();
}

function handleJobCardActivate(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const card = target.closest(".job-card");
  if (!card) return;
  const jobId = card.getAttribute("data-job-id");
  if (!jobId) return;
  showJobDetail(jobId);
}

function renderJobListing() {
  const jobs = applyFiltersAndSort();
  const resultsCountEl = qs("#results-count");
  const listContainer = qs("#jobs-list");
  const paginationContainer = qs("#jobs-pagination");

  const totalJobs = jobs.length;
  if (resultsCountEl) {
    resultsCountEl.textContent =
      totalJobs === 0
        ? "Aucune offre ne correspond à vos critères."
        : `${totalJobs} offre${totalJobs > 1 ? "s" : ""} trouvée${totalJobs > 1 ? "s" : ""}`;
  }

  if (!listContainer || !paginationContainer) return;

  const totalPages = Math.max(1, Math.ceil(totalJobs / JOBS_PER_PAGE));
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const startIndex = (state.currentPage - 1) * JOBS_PER_PAGE;
  const pageJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  listContainer.innerHTML = pageJobs
    .map((job) => createJobCardHTML(job))
    .join("");

  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Précédent";
  prevBtn.className = "page-btn";
  prevBtn.disabled = state.currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderJobListing();
    }
  });
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = String(i);
    btn.className = "page-btn";
    if (i === state.currentPage) {
      btn.setAttribute("aria-current", "page");
    }
    btn.addEventListener("click", () => {
      state.currentPage = i;
      renderJobListing();
    });
    paginationContainer.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Suivant";
  nextBtn.className = "page-btn";
  nextBtn.disabled = state.currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (state.currentPage < totalPages) {
      state.currentPage++;
      renderJobListing();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

function showJobDetail(jobId) {
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) return;
  state.currentJobId = jobId;

  const detailContainer = qs("#job-detail");
  if (!detailContainer) return;

  const durationText = job.durationMonths
    ? `${job.durationMonths} mois`
    : "Non précisé";

  detailContainer.innerHTML = `
    <header class="job-detail-header">
      <div>
        <h1 class="job-detail-title">${job.title}</h1>
        <p>${job.company} • ${job.location}</p>
        <div class="job-detail-meta">
          <span>${job.contract === "interim" ? "Intérim" : job.contract === "cdd" ? "CDD" : "Mission courte"}</span>
          <span>${durationText}</span>
          <span>Publiée le ${formatDate(job.publishedAt)}</span>
        </div>
      </div>
      <button class="btn primary" type="button" data-open-apply>
        Postuler maintenant
      </button>
    </header>
    <div class="job-detail-body">
      <section>
        <h2 class="job-section-title">Description du poste</h2>
        <p>${job.description}</p>
      </section>
      <aside class="job-detail-aside">
        <dl>
          <dt>Entreprise</dt>
          <dd>${job.company}</dd>
          <dt>Lieu</dt>
          <dd>${job.location}</dd>
          <dt>Durée</dt>
          <dd>${durationText}</dd>
          <dt>Rémunération mensuelle (brut)</dt>
          <dd>${formatCurrency(job.salary)}</dd>
          <dt>Date de début</dt>
          <dd>${formatDate(job.startDate)}</dd>
        </dl>
        <div class="share-row">
          Partager :
          <div class="share-buttons">
            <button class="share-btn" type="button">LinkedIn</button>
            <button class="share-btn" type="button">Email</button>
          </div>
        </div>
      </aside>
    </div>
  `;

  const btnApply = qs("[data-open-apply]", detailContainer);
  if (btnApply) {
    btnApply.addEventListener("click", () => openApplyModal(job));
  }

  const showViewEvent = new Event("click");
  const fakeButton = document.createElement("button");
  fakeButton.setAttribute("data-view", "job-detail");
  document.body.appendChild(fakeButton);
  fakeButton.dispatchEvent(showViewEvent);
  fakeButton.remove();
}

let lastFocusedElement = null;

function initApplyModal() {
  const modal = qs("#apply-modal");
  if (!modal) return;

  modal.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.hasAttribute("data-close-modal") && modal) {
      closeApplyModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeApplyModal();
    }
  });

  const form = qs("#apply-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleApplySubmit();
    });
  }
}

function openApplyModal(job) {
  const modal = qs("#apply-modal");
  if (!modal) return;
  lastFocusedElement = document.activeElement;

  const titleEl = qs("#apply-job-title");
  if (titleEl) {
    titleEl.textContent = `${job.title} — ${job.company} (${job.location})`;
  }

  const messageEl = qs("#apply-message");
  if (messageEl) messageEl.textContent = "";

  const form = qs("#apply-form");
  if (form) form.reset();

  modal.setAttribute("aria-hidden", "false");
  const firstInput = qs("#apply-form input[name='fullName']");
  if (firstInput) firstInput.focus();
}

function closeApplyModal() {
  const modal = qs("#apply-modal");
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  if (lastFocusedElement && lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function handleApplySubmit() {
  const form = qs("#apply-form");
  const messageEl = qs("#apply-message");
  if (!form || !messageEl) return;

  const data = new FormData(form);
  const fullName = (data.get("fullName") || "").toString().trim();
  const email = (data.get("email") || "").toString().trim();
  const phone = (data.get("phone") || "").toString().trim();
  const cv = data.get("cv");

  if (!fullName || !email || !phone || !cv) {
    messageEl.textContent =
      "Merci de remplir tous les champs obligatoires avant d’envoyer votre candidature.";
    messageEl.style.color = "#b91c1c";
    return;
  }

  messageEl.style.color = "#047857";
  messageEl.textContent =
    "Votre candidature a été envoyée. Un email de confirmation vous sera adressé (simulation).";

  setTimeout(() => {
    closeApplyModal();
  }, 2000);
}

function initRecruiterSection() {
  try {
    const stored = window.localStorage.getItem("yanza-recruiter-jobs");
    if (stored) {
      state.recruiterJobs = JSON.parse(stored);
      state.jobs = [...MOCK_JOBS, ...state.recruiterJobs];
    }
  } catch {
    state.recruiterJobs = [];
  }

  const form = qs("#new-job-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleNewJobSubmit();
    });
  }

  renderRecruiterJobs();
}

function handleNewJobSubmit() {
  const form = qs("#new-job-form");
  const messageEl = qs("#new-job-message");
  if (!form || !messageEl) return;

  const data = new FormData(form);
  const title = (data.get("title") || "").toString().trim();
  const company = (data.get("company") || "").toString().trim();
  const location = (data.get("location") || "").toString().trim();
  const contract = (data.get("contract") || "").toString().trim();
  const salary = Number(data.get("salary") || 0);
  const durationMonths = Number(data.get("durationMonths") || 0);
  const sector = (data.get("sector") || "").toString().trim();
  const description = (data.get("description") || "").toString().trim();

  if (!title || !company || !location || !contract || !description) {
    messageEl.textContent =
      "Merci de renseigner les champs obligatoires marqués d’un *.";
    messageEl.style.color = "#b91c1c";
    return;
  }

  const id = `job-${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);

  const newJob = {
    id,
    title,
    company,
    location,
    country: location.split(",").pop()?.trim() || "",
    contract,
    sector,
    salary: salary || undefined,
    durationMonths: durationMonths || undefined,
    startDate: today,
    publishedAt: today,
    description,
  };

  state.recruiterJobs.unshift(newJob);
  state.jobs.unshift(newJob);

  try {
    window.localStorage.setItem(
      "yanza-recruiter-jobs",
      JSON.stringify(state.recruiterJobs)
    );
  } catch {
    // storage may fail silently in private mode
  }

  messageEl.style.color = "#047857";
  messageEl.textContent = "Offre publiée (simulation). Elle apparaît maintenant dans la liste.";
  form.reset();

  renderRecruiterJobs();
  renderJobListing();
  renderAdminView();
}

function renderRecruiterJobs() {
  const container = qs("#recruiter-jobs");
  if (!container) return;

  if (state.recruiterJobs.length === 0) {
    container.innerHTML =
      '<p class="hint">Aucune offre publiée pour le moment. Commencez en remplissant le formulaire ci-dessus.</p>';
    return;
  }

  container.innerHTML = state.recruiterJobs
    .map(
      (job) => `
      <article class="card">
        <div class="job-card-header">
          <div>
            <h3 class="card-title">${job.title}</h3>
            <p class="card-subtitle">${job.company}</p>
          </div>
          <span class="badge primary">En ligne</span>
        </div>
        <p class="card-text">${job.location}</p>
        <p class="card-text"><strong>${formatCurrency(
          job.salary
        )}</strong> / mois</p>
        <p class="card-text">Publiée le ${formatDate(job.publishedAt)}</p>
      </article>
    `
    )
    .join("");
}

function initAdminView() {
  renderAdminView();
}

function renderAdminView() {
  const statsContainer = qs("#admin-stats");
  const jobsContainer = qs("#admin-jobs");
  if (!statsContainer || !jobsContainer) return;

  const totalJobs = state.jobs.length;
  const totalRecruiterJobs = state.recruiterJobs.length;
  const totalInterim = state.jobs.filter(
    (j) => j.contract === "interim"
  ).length;

  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-card-label">Offres actives</div>
      <div class="stat-card-value">${totalJobs}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">Offres recruteurs</div>
      <div class="stat-card-value">${totalRecruiterJobs}</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">Missions d’intérim</div>
      <div class="stat-card-value">${totalInterim}</div>
    </div>
  `;

  jobsContainer.innerHTML = state.jobs
    .map(
      (job) => `
      <article class="card">
        <div class="job-card-header">
          <div>
            <h3 class="card-title">${job.title}</h3>
            <p class="card-subtitle">${job.company} • ${job.location}</p>
          </div>
          <span class="badge">${
            job.contract === "interim" ? "Intérim" : job.contract
          }</span>
        </div>
        <p class="card-text">Publiée le ${formatDate(
          job.publishedAt
        )}</p>
        <p class="hint">Statut: en attente de validation (simulation front-end)</p>
      </article>
    `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", init);


