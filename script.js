// Ordered steps and labels for Jump to step menu
const stepMeta = [
  { id: "start", label: "Start" },
  { id: "prep_appointment", label: "Appointment prep" },
  { id: "prep_walkin", label: "Walk in prep" },
  { id: "meet", label: "Meet and greet" },
  { id: "decision", label: "Decision" },
  { id: "person_create", label: "Create Person if needed" },
  { id: "adopt_main_1", label: "Adopter in PetPoint" },
  { id: "adopt_main_2", label: "Outcome started" },
  { id: "adopt_main_3", label: "Vouchers" },
  { id: "adopt_main_4", label: "Microchip consent" },
  { id: "adopt_main_5", label: "Folder ADA forms" },
  { id: "adopt_main_6", label: "Contract" },
  { id: "adopt_main_7", label: "Payment" },
  { id: "adopt_after", label: "Sending kitty home" },
  { id: "after_leave", label: "Adopter memo" },
  { id: "after_memo_cat", label: "Cat memo" },
  { id: "after_association", label: "Association updated" },
  { id: "after_upload_ada", label: "Upload ADA forms" },
  { id: "after_upload_consult", label: "Upload consult" },
  { id: "after_receipt", label: "Receipt" },
  { id: "after_calendar", label: "Calendar" },
  { id: "after_photo", label: "Photo to Kim" },
  { id: "after_email", label: "Outlook email" },
  { id: "after_whiteboard", label: "Whiteboards" },
  { id: "no_adopt", label: "No adoption wrap up" },
  { id: "stop_staff", label: "Stop and notify staff" },
  { id: "done", label: "Complete" }
];

const orderedStepIds = stepMeta.map(s => s.id);

const steps = Array.from(document.querySelectorAll(".step"));
const progressLabel = document.getElementById("progress-label");
const progressBar = document.getElementById("progress-bar");
const jumpSelect = document.getElementById("step-jump");

let historyStack = ["start"];
let interactionType = null;
let currentStepId = "start";
let completedSteps = new Set();

// Build Jump to step dropdown
function buildJumpDropdown() {
  jumpSelect.innerHTML = "";
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "Jump to step…";
  jumpSelect.appendChild(defaultOpt);

  stepMeta.forEach((meta, index) => {
    const opt = document.createElement("option");
    opt.value = meta.id;
    const stepNum = index + 1;
    const isDone = completedSteps.has(meta.id);
    const prefix = isDone ? "✓ " : stepNum + ". ";
    opt.textContent = prefix + meta.label;
    jumpSelect.appendChild(opt);
  });
}

function refreshJumpDropdownLabels() {
  // rebuild options so checkmarks update
  buildJumpDropdown();
  // keep current selection empty for tap navigation
  jumpSelect.value = "";
}

function setInteraction(type) {
  interactionType = type;
  if (type === "appointment") {
    goTo("prep_appointment");
  } else {
    goTo("prep_walkin");
  }
}

function startOver() {
  interactionType = null;
  completedSteps = new Set();
  historyStack = ["start"];
  currentStepId = "start";
  showStep("start");
  refreshJumpDropdownLabels();
}

function goToAfterReceiptNext() {
  if (interactionType === "walkin") {
    goTo("after_photo");
  } else {
    goTo("after_calendar");
  }
}

function jumpToStep(id) {
  if (!id) return;
  goTo(id);
  jumpSelect.value = "";
}

function showStep(id) {
  steps.forEach(step => {
    step.classList.toggle("active", step.dataset.stepId === id);
  });

  const index = orderedStepIds.indexOf(id);
  if (index >= 0) {
    const stepNum = index + 1;
    const total = orderedStepIds.length;
    progressLabel.textContent = "Step " + stepNum + " of " + total;
    const pct = Math.round((stepNum - 1) / (total - 1) * 100);
    progressBar.style.width = pct + "%";
  } else {
    progressBar.style.width = "0%";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goTo(id, reset = false) {
  if (reset) {
    historyStack = [id];
    completedSteps = new Set();
  } else {
    if (currentStepId && currentStepId !== id) {
      completedSteps.add(currentStepId);
    }
    const last = historyStack[historyStack.length - 1];
    if (last !== id) {
      historyStack.push(id);
    }
  }
  currentStepId = id;
  showStep(id);
  refreshJumpDropdownLabels();
}

function goBack() {
  if (historyStack.length > 1) {
    historyStack.pop();
    currentStepId = historyStack[historyStack.length - 1];
    showStep(currentStepId);
  } else {
    currentStepId = "start";
    showStep("start");
  }
}

/* Help content */

const helpContent = {
  start:
    "Choose <strong>Scheduled appointment</strong> if this person was on the calendar.<br><br>" +
    "Choose <strong>Walk in</strong> if they arrived without a scheduled time.",

  prep_appointment:
    "<p><strong>For a scheduled appointment:</strong></p>" +
    "<ol>" +
    "<li>Review the consultation form before the meet and greet.</li>" +
    "<li>In PetPoint, check for any Do Not Adopt flags.</li>" +
    "</ol>",

  prep_walkin:
    "<p><strong>For a walk in:</strong></p>" +
    "<ol>" +
    "<li>Have the visitor complete the consultation form.</li>" +
    "<li>Make sure all required questions are answered.</li>" +
    "<li>Create or update their Person record in PetPoint.</li>" +
    "</ol>",

  meet:
    "<p>During the meet and greet:</p>" +
    "<ul>" +
    "<li>Watch how the person handles and talks about the cat.</li>" +
    "<li>If anything feels off, pause and talk to staff.</li>" +
    "</ul>",

  decision:
    "<p>If they clearly chose a specific cat today, pick <strong>Yes</strong> and move into the adoption steps.</p>" +
    "<p>If they are still thinking, or no cat is going home today, pick <strong>No</strong>.</p>",

  person_create:
    "<p><strong>Create the Person record:</strong></p>" +
    "<ol>" +
    "<li>From the main search, confirm there is not already a record for this person.</li>" +
    "<li>If none exists, use the green plus to create a new Person.</li>" +
    "<li>Fill in name, address, phone, and email so you can contact them later.</li>" +
    "</ol>",

  adopt_main_1:
    "<p><strong>Person record check:</strong></p>" +
    "<ol>" +
    "<li>Search by name, email, or phone.</li>" +
    "<li>Confirm contact info is current.</li>" +
    "<li>Merge or correct duplicates if needed.</li>" +
    "</ol>",

  adopt_main_2:
    "<p><strong>Starting the adoption outcome:</strong></p>" +
    "<ol>" +
    "<li>Open the <strong>Person</strong> record for the adopter.</li>" +
    "<li>Use the green plus menu to add a new <strong>Outcome</strong>.</li>" +
    "<li>Choose <strong>Adoption</strong> and confirm you are on the correct person.</li>" +
    "<li>Link the correct cat and check that Type, Subtype, and Status are correct.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='adopt_outcome_start'>Show where to start Outcome</button>" +
    "<button class='help-detail' data-subhelp='adopt_outcome_fields'>Show Outcome fields example</button>" +
    "<button class='help-detail' data-subhelp='multi_cat_outcome'>Multi cat outcome example</button>",

  adopt_main_3:
    "<p><strong>Vouchers:</strong></p>" +
    "<ol>" +
    "<li>Confirm which voucher each cat should receive.</li>" +
    "<li>Create the voucher from the cat record and link it to the adoption.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='voucher_cat'>Show voucher example</button>",

  adopt_main_4:
    "<p>Review microchip and wellness options with the adopter and record their choice.</p>",

  adopt_main_5:
    "<p>Go through each ADA in the folder, explain any special notes, and collect signatures.</p>",

  adopt_main_6:
    "<p>Use the contract print option after the outcome is completed.</p>" +
    "<button class='help-detail' data-subhelp='contract_print'>Show where to print contract</button>",

  adopt_main_7:
    "<p>Make sure the payment slip, receipt, and PetPoint payment match.</p>",

  adopt_after:
    "<p>Double check the adoption bag, litter sample, weight, microchip, and any printed items before the adopter leaves.</p>",

  after_leave:
    "<p>Add an Adoption Outcome memo on the person record so future staff can see how the appointment went.</p>" +
    "<button class='help-detail' data-subhelp='adopter_memo'>Show adopter memo example</button>",

  after_memo_cat:
    "<p>Add a short Outcome - Adoption memo on each cat so you can see where they went later.</p>" +
    "<button class='help-detail' data-subhelp='cat_memo'>Show cat memo example</button>",

  after_association:
    "<p>Update the association to show this person is now an Adopter.</p>" +
    "<button class='help-detail' data-subhelp='association_new'>Show association example</button>",

  after_upload_ada:
    "<p>These steps are already listed on the main screen. Use this view if you want to see a larger screenshot for reference.</p>",

  after_upload_consult:
    "<p>Upload the scanned consultation form to the person record.</p>" +
    "<button class='help-detail' data-subhelp='consult_upload'>Consultation form upload screen</button>",

  after_receipt:
    "<p>Use these screenshots if you want visual guidance for the receipt and payment.</p>" +
    "<button class='help-detail' data-subhelp='receipt_new'>How to create new receipt</button>" +
    "<button class='help-detail' data-subhelp='receipt_screen'>Receipt - New screen example</button>" +
    "<button class='help-detail' data-subhelp='multi_cat_receipt'>Multi cat receipt example</button>",

  after_calendar:
    "<p>Close or update the calendar appointment to show the correct outcome.</p>",

  after_photo:
    "<p>Follow FKR photo guidelines and text the photo to Kim using the usual number or thread.</p>",

  after_email:
    "<p>Send the Outlook adoption email with cats adopted, PP done, whether photo was sent, and counselor names.</p>",

  after_whiteboard:
    "<p>Update room or lobby boards so they match the cats currently on site.</p>",

  no_adopt:
    "<p>If no cat was adopted, make sure the notes and future follow up are clear.</p>",

  stop_staff:
    "<p>When you have a concern, stop the process and speak with staff before moving forward.</p>",

  done:
    "<p>You have finished all required tasks for this case.</p>"
};

const subHelpContent = {
  adopt_outcome_start: {
    title: "Where to start Outcome on person",
    html:
      "<img src='1-create-new-outcome-on-person.png' alt='Add Outcome from green plus menu on person' class='help-image'>"
  },
  adopt_outcome_fields: {
    title: "Outcome form example",
    html:
      "<img src='2-outcome-form-filled.png' alt='Outcome New form filled example' class='help-image'>"
  },
  voucher_cat: {
    title: "Voucher on cat example",
    html:
      "<img src='3-voucher-on-cat.png' alt='Voucher Automatic screen on cat' class='help-image'>"
  },
  contract_print: {
    title: "Where to print contract",
    html:
      "<img src='4-create-contract-on-person-outcome.png' alt='Contract print option on adoption outcome' class='help-image'>"
  },
  adopter_memo: {
    title: "Adopter memo on person",
    html:
      "<img src='5-Adopter-memo.png' alt='Adoption Outcome memo on person' class='help-image'>"
  },
  association_new: {
    title: "Association - new example",
    html:
      "<img src='6-Association.png' alt='Association New screen' class='help-image'>"
  },
  cat_memo: {
    title: "Cat outcome memo",
    html:
      "<img src='7-memo-on-pet.png' alt='Outcome memo on pet' class='help-image'>"
  },
  receipt_new: {
    title: "How to create new receipt",
    html:
      "<img src='8-new-receipt-on-person.png' alt='New receipt from person record' class='help-image'>"
  },
  receipt_screen: {
    title: "Receipt - New screen example",
    html:
      "<img src='9-receipt-form.png' alt='Receipt form and payment panel' class='help-image'>"
  },
  multi_cat_outcome: {
    title: "Multi cat outcome example",
    html:
      "<img src='1-multiple-cat-outcome-on-person.png' alt='Outcome - New multi cat example' class='help-image'>"
  },
  multi_cat_receipt: {
    title: "Multi cat receipt example",
    html:
      "<img src='8-multi-cat-receipt-on-person.png' alt='Multi cat receipt example' class='help-image'>"
  },
  consult_upload: {
    title: "Consultation form upload screen",
    html:
      "<img src='10-Consultation-Form.png' alt='Consultation form upload example' class='help-image'>"
  }
};

let currentHelpStep = null;

function showHelp(stepId) {
  currentHelpStep = stepId;
  const overlay = document.getElementById("help-overlay");
  const titleEl = document.getElementById("help-title");
  const textEl = document.getElementById("help-text");
  const backBtn = document.getElementById("help-back-btn");

  const defaultTitle = "Step help";
  const defaultText =
    "If you are unsure what to do on this step, pause and ask a staff member for guidance.";

  let title = defaultTitle;
  let text = helpContent[stepId] || defaultText;

  const stepEl = document.querySelector(
    '.step[data-step-id="' + stepId + '"] .step-title'
  );
  if (stepEl) {
    title = stepEl.textContent;
  }

  titleEl.textContent = title;
  textEl.innerHTML = text;

  backBtn.style.display = "none";
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function showSubHelp(subId) {
  const data = subHelpContent[subId];
  if (!data) return;

  const overlay = document.getElementById("help-overlay");
  const titleEl = document.getElementById("help-title");
  const textEl = document.getElementById("help-text");
  const backBtn = document.getElementById("help-back-btn");

  titleEl.textContent = data.title || "More details";
  textEl.innerHTML = data.html || "";
  backBtn.style.display = currentHelpStep ? "inline-flex" : "none";

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function backToMainHelp() {
  if (currentHelpStep) {
    showHelp(currentHelpStep);
  }
}

function hideHelp() {
  const overlay = document.getElementById("help-overlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
}

// Click handlers for help pills and screenshot zoom

document.getElementById("help-card").addEventListener("click", function (e) {
  const subBtn = e.target.closest("[data-subhelp]");
  if (subBtn) {
    const subId = subBtn.getAttribute("data-subhelp");
    showSubHelp(subId);
    return;
  }

  const img = e.target.closest(".help-image");
  if (img) {
    showZoom(img.getAttribute("src"));
  }
});

function showZoom(src) {
  const overlay = document.getElementById("image-zoom-overlay");
  const img = document.getElementById("zoom-image");
  img.src = src;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function hideZoom() {
  const overlay = document.getElementById("image-zoom-overlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
}

// Init

buildJumpDropdown();
showStep("start");
