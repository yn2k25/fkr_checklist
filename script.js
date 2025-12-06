// Minimal question data structure. Plug your real questions in here.
const questions = [
  {
    id: "q1",
    section: "Meet and greet",
    text: "Any concerning behavior?",
    helpTitle: "Any concerning behavior?",
    helpIntro: "During the meet and greet:",
    helpBullets: [
      "Watch how the person handles and talks about the cat.",
      "If anything feels off, pause and talk to staff."
    ],
    screenshots: [
      // put screenshot URLs here if you want them zoomable
      // "screenshot1.png"
    ]
  }
  // add more items as needed
];

let currentIndex = 0;

function renderQuestion(index) {
  const item = questions[index];
  if (!item) return;

  document.getElementById("questionText").textContent = item.text;
  document.getElementById("sectionLabel").textContent = item.section;

  document.getElementById("helpTitle").textContent = item.helpTitle;
  document.getElementById("helpIntro").textContent = item.helpIntro;

  const list = document.getElementById("helpList");
  list.innerHTML = "";
  (item.helpBullets || []).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    list.appendChild(li);
  });

  const shotContainer = document.getElementById("helpScreenshotContainer");
  shotContainer.innerHTML = "";
  (item.screenshots || []).forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Screenshot";
    img.className = "help-screenshot-thumb";
    img.addEventListener("click", () => openZoom(src));
    shotContainer.appendChild(img);
  });

  const progress =
    questions.length > 1 ? ((index + 1) / questions.length) * 100 : 100;
  document.getElementById("progressFill").style.width = progress + "%";

  const jump = document.getElementById("jumpSelect");
  if (jump && jump.value !== String(index)) {
    jump.value = String(index);
  }
}

function buildJumpMenu() {
  const select = document.getElementById("jumpSelect");
  select.innerHTML = "";

  questions.forEach((q, idx) => {
    const opt = document.createElement("option");
    const stepNumber = idx + 1;
    opt.value = String(idx);
    opt.textContent = stepNumber + ". " + q.text;
    select.appendChild(opt);
  });

  select.addEventListener("change", (e) => {
    const value = parseInt(e.target.value, 10);
    if (!Number.isNaN(value)) {
      currentIndex = value;
      renderQuestion(currentIndex);
    }
  });
}

// Help modal

function openHelp() {
  const overlay = document.getElementById("helpModal");
  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
}

function closeHelp() {
  const overlay = document.getElementById("helpModal");
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
}

// Zoom overlay

function openZoom(src) {
  const overlay = document.getElementById("zoomOverlay");
  const img = document.getElementById("zoomImage");
  img.src = src;
  overlay.classList.add("visible");
  overlay.setAttribute("aria-hidden", "false");
}

function closeZoom() {
  const overlay = document.getElementById("zoomOverlay");
  overlay.classList.remove("visible");
  overlay.setAttribute("aria-hidden", "true");
}

function wireEvents() {
  // help buttons
  document
    .getElementById("helpChip")
    .addEventListener("click", openHelp);

  document
    .getElementById("helpCloseBtn")
    .addEventListener("click", closeHelp);

  // close help by clicking outside dialog
  document.getElementById("helpModal").addEventListener("click", (e) => {
    if (e.target.id === "helpModal") {
      closeHelp();
    }
  });

  // zoom close
  document
    .getElementById("zoomCloseButton")
    .addEventListener("click", closeZoom);

  // close zoom by tapping dark background
  document.getElementById("zoomOverlay").addEventListener("click", (e) => {
    if (e.target.id === "zoomOverlay") {
      closeZoom();
    }
  });

  // nav buttons
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderQuestion(currentIndex);
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion(currentIndex);
    }
  });

  // answer buttons selection
  document.querySelectorAll(".answer-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".answer-button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      // hook your existing logic here using btn.dataset.answer
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildJumpMenu();
  wireEvents();
  renderQuestion(currentIndex);
});
