// Basic checklist data. Add more questions or sections as needed.
const questions = [
  {
    id: "q1",
    section: "Meet and greet",
    text: "Any concerning behavior?",
    answers: [
      { id: "no_concern", label: "No - everything looks appropriate", kind: "positive" },
      { id: "yes_concern", label: "Yes - concern exists", kind: "negative" },
      { id: "opt3", label: "Option 3", kind: "neutral" },
      { id: "opt4", label: "Option 4", kind: "neutral" }
    ],
    helpTitle: "Any concerning behavior?",
    helpIntro: "During the meet and greet:",
    helpBullets: [
      "Watch how the person handles and talks about the cat.",
      "If anything feels off, pause and talk to staff."
    ],
    screenshots: [
      // example: "images/outcome-dialog.png"
    ]
  }
  // add more question objects here
];

let currentIndex = 0;
const answersByQuestion = {}; // simple storage of chosen answers

/* rendering helpers */

function renderQuestion(index) {
  const item = questions[index];
  if (!item) return;

  // text and section
  document.getElementById("questionText").textContent = item.text;
  document.getElementById("sectionLabel").textContent = item.section;

  // answers
  const answersBlock = document.getElementById("answersBlock");
  answersBlock.innerHTML = "";

  item.answers.forEach((ans) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = ans.label;
    btn.className =
      "answer-button " +
      (ans.kind === "positive"
        ? "answer-positive"
        : ans.kind === "negative"
        ? "answer-negative"
        : "answer-neutral");

    btn.dataset.answerId = ans.id;

    // restore selected state
    if (answersByQuestion[item.id] === ans.id) {
      btn.classList.add("selected");
    }

    btn.addEventListener("click", () => {
      answersByQuestion[item.id] = ans.id;
      document
        .querySelectorAll(".answer-button")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });

    answersBlock.appendChild(btn);
  });

  // help content
  document.getElementById("helpTitle").textContent = item.helpTitle;
  document.getElementById("helpIntro").textContent = item.helpIntro;

  const helpList = document.getElementById("helpList");
  helpList.innerHTML = "";
  (item.helpBullets || []).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    helpList.appendChild(li);
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

  // progress bar
  const progress =
    questions.length > 1 ? ((index + 1) / questions.length) * 100 : 100;
  document.getElementById("progressFill").style.width = progress + "%";

  // jump dropdown sync
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

/* help modal */

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

/* zoom overlay */

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

/* wiring */

function wireEvents() {
  // help chip and modal close
  document.getElementById("helpChip").addEventListener("click", openHelp);
  document.getElementById("helpCloseBtn").addEventListener("click", closeHelp);

  // click outside dialog to close help
  document.getElementById("helpModal").addEventListener("click", (e) => {
    if (e.target.id === "helpModal") {
      closeHelp();
    }
  });

  // zoom close bar and click on dark background
  document
    .getElementById("zoomCloseButton")
    .addEventListener("click", closeZoom);

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
}

/* init */

document.addEventListener("DOMContentLoaded", () => {
  buildJumpMenu();
  wireEvents();
  renderQuestion(currentIndex);
});
