// -------------------------------------------------------------
// FKR Adoption Checklist - Navigation Engine (Workflow v2)
// -------------------------------------------------------------

// LINEAR WORKFLOW ORDER (26 steps)
const linearSteps = [
  "start",
  "prep_appointment",
  "prep_walkin",
  "meet",
  "decision",
  "person_create",
  "adopt_main_1",
  "adopt_main_2",
  "adopt_main_3",
  "adopt_main_4",
  "adopt_main_5",
  "adopt_main_6",
  "adopt_main_7",
  "adopt_after",
  "after_leave",
  "after_memo_cat",
  "after_association",
  "after_upload_ada",
  "after_upload_consult",
  "after_receipt",
  "after_calendar",
  "after_photo",
  "after_email",
  "after_paymentfile",
  "after_whiteboard",
  "done"
];

// BRANCH SCREENS (not part of linear flow)
const branches = ["stop_staff", "no_adopt"];

let currentStep = "start";
let historyStack = [];

// -------------------------------------------------------------
// BUTTON ACTION MAP (exactly per workflow spec)
// -------------------------------------------------------------
const buttonActions = {
  start: {
    0: "prep_appointment",
    1: "prep_walkin"
  },
  prep_appointment: {
    0: "meet",
    1: "start"
  },
  prep_walkin: {
    0: "meet",
    1: "start"
  },
  meet: {
    0: "decision",
    1: "stop_staff", // branch
    2: "prep_appointment" // back
  },
  decision: {
    0: "person_create",
    1: "no_adopt", // branch
    2: "meet"
  },
  person_create: {
    0: "adopt_main_1",
    1: "adopt_main_1",
    2: "decision"
  },
  adopt_main_1: {
    0: "adopt_main_2",
    1: null, // help button handled separately
    2: "person_create"
  },
  adopt_main_2: {
    0: "adopt_main_3",
    1: null,
    2: "adopt_main_1"
  },
  adopt_main_3: {
    0: "adopt_main_4",
    1: null,
    2: "adopt_main_2"
  },
  adopt_main_4: {
    0: "adopt_main_5",
    1: null,
    2: "adopt_main_3"
  },
  adopt_main_5: {
    0: "adopt_main_6",
    1: null,
    2: "adopt_main_4"
  },
  adopt_main_6: {
    0: "adopt_main_7",
    1: null,
    2: "adopt_main_5"
  },
  adopt_main_7: {
    0: "adopt_after",
    1: "adopt_main_6"
  },
  adopt_after: {
    0: "after_leave",
    1: "adopt_main_7"
  },
  after_leave: {
    0: "after_memo_cat",
    1: null,
    2: "adopt_after"
  },
  after_memo_cat: {
    0: "after_association",
    1: null,
    2: "after_leave"
  },
  after_association: {
    0: "after_upload_ada",
    1: "after_memo_cat"
  },
  after_upload_ada: {
    0: "after_upload_consult",
    1: null,
    2: "after_association"
  },
  after_upload_consult: {
    0: "after_receipt",
    1: null,
    2: "after_upload_ada"
  },
  after_receipt: {
    0: "after_calendar",
    1: null,
    2: "after_upload_consult"
  },
  after_calendar: {
    0: "after_photo",
    1: "after_receipt"
  },
  after_photo: {
    0: "after_email",
    1: "after_calendar"
  },
  after_email: {
    0: "after_paymentfile",
    1: "after_photo"
  },
  after_paymentfile: {
    0: "after_whiteboard",
    1: "after_email"
  },
  after_whiteboard: {
    0: "done",
    1: "after_paymentfile"
  },

  // ------------ BRANCH LOGIC ------------

  // Pause → return to Step 1
  stop_staff: {
    0: "start",
    1: "meet"
  },

  // No adoption → go to final screen (Step 26)
  no_adopt: {
    0: "done",
    1: "decision"
  },

  done: {
    0: "start"
  }
};

// -------------------------------------------------------------
// STEP CHANGE ENGINE
// -------------------------------------------------------------
function showStep(stepId) {
  document.querySelectorAll(".step").forEach(step => {
    step.classList.remove("active");
  });

  const stepEl = document.querySelector(`.step[data-step-id="${stepId}"]`);
  if (!stepEl) return;

  stepEl.classList.add("active");
  currentStep = stepId;

  updateProgress();
  attachButtonHandlers(stepEl);
}

// -------------------------------------------------------------
// BUTTON HANDLERS
// -------------------------------------------------------------
function attachButtonHandlers(stepEl) {
  const buttons = stepEl.querySelectorAll("button[data-btn-index]");

  buttons.forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute("data-btn-index"), 10);
      const action = buttonActions[currentStep]?.[idx];

      // Screenshot help ("How to…") — no navigation
      if (action === null) return;

      if (action) {
        historyStack.push(currentStep);
        showStep(action);
      }
    };
  });
}

// -------------------------------------------------------------
// PROGRESS DISPLAY
// -------------------------------------------------------------
function updateProgress() {
  const progressIndex = linearSteps.indexOf(currentStep);

  if (progressIndex === -1) {
    // Branch screens have no progress bar updates
    document.getElementById("progress-label").innerText = "—";
    document.getElementById("progress-bar").style.width = "0%";
    return;
  }

  const stepNum = progressIndex + 1;
  const total = linearSteps.length;

  document.getElementById("progress-label").innerText = `Step ${stepNum}`;
  document.getElementById("progress-bar").style.width =
    `${(stepNum / total) * 100}%`;
}

// -------------------------------------------------------------
// START OVER
// -------------------------------------------------------------
function startOver() {
  historyStack = [];
  showStep("start");
}

// -------------------------------------------------------------
// BACK NAVIGATION
// -------------------------------------------------------------
function goBack() {
  if (historyStack.length === 0) return;
  const prev = historyStack.pop();
  showStep(prev);
}

// -------------------------------------------------------------
// JUMP MENU
// -------------------------------------------------------------
function populateJumpMenu() {
  const select = document.getElementById("step-jump");
  select.innerHTML = "";

  linearSteps.forEach((id, i) => {
    const stepEl = document.querySelector(`.step[data-step-id="${id}"]`);
    if (!stepEl) return;

    const title = stepEl.querySelector(".step-title")?.innerText || `Step ${i+1}`;
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${i + 1}. ${title}`;
    select.appendChild(opt);
  });
}

function jumpToStep(id) {
  historyStack.push(currentStep);
  showStep(id);
}

// -------------------------------------------------------------
// IMAGE ZOOM MODAL
// -------------------------------------------------------------
function openZoom(src) {
  const overlay = document.getElementById("image-zoom-overlay");
  const img = document.getElementById("zoom-image");

  img.src = src;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function closeZoom() {
  const overlay = document.getElementById("image-zoom-overlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.getElementById("zoom-image").src = "";
}

// -------------------------------------------------------------
// HELP MODAL (framework preserved, not used)
// -------------------------------------------------------------
function hideHelp() {
  document.getElementById("help-overlay").classList.remove("active");
}
function helpBack() {}

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  populateJumpMenu();
  showStep("start");
});
