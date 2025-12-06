// History + step tracking
const historyStack = ['start'];
const steps = Array.from(document.querySelectorAll('.step'));
const progressLabel = document.getElementById('progress-label');
const progressBar = document.getElementById('progress-bar');
const stepJumpSelect = document.getElementById('step-jump');

// Step order used for progress + JumpTo
const orderedStepIds = [
  'start',
  'prep_appointment',
  'prep_walkin',
  'meet',
  'decision',
  'adopt_main_create_person',
  'no_adopt_create_person',
  'create_person',
  'adopt_main_1',
  'adopt_main_2',
  'adopt_main_3',
  'adopt_main_4',
  'adopt_main_5',
  'adopt_main_6',
  'adopt_main_7',
  'adopt_after',
  'after_leave',
  'after_memo_cat',
  'after_association',
  'after_upload_ada',
  'after_upload_consult',
  'after_receipt',
  'after_calendar',
  'after_photo',
  'after_email',
  'after_whiteboard',
  'no_adopt',
  'stop_staff',
  'done'
];

// which path (appointment / walk-in)
let interactionType = null;
// which path we came from for create_person
let createPersonReturnTarget = null;
// set of steps that have been visited / completed
const completedSteps = new Set();

// map stepId -> title text
const stepLabels = {};

// Help overlay content
const helpContent = {
  start:
    "Choose <strong>Scheduled appointment</strong> if this person was on the calendar.<br><br>" +
    "Choose <strong>Walk in</strong> if they arrived without a scheduled time.",

  prep_appointment:
    "<p><strong>For a scheduled appointment:</strong></p>" +
    "<ol>" +
    "<li>Open the consultation form and review it before the meet and greet.</li>" +
    "<li>In PetPoint, search for the person and check for any Do Not Adopt flags.</li>" +
    "<li>If you see anything concerning, pause and talk with staff before you continue.</li>" +
    "</ol>",

  prep_walkin:
    "<p><strong>For a walk in:</strong></p>" +
    "<ol>" +
    "<li>Have the visitor complete the consultation form.</li>" +
    "<li>Check that all required questions are answered.</li>" +
    "<li>In PetPoint, search for the person or create a new record.</li>" +
    "<li>Confirm they are not on the Do Not Adopt list before starting a meet and greet.</li>" +
    "</ol>",

  meet:
    "<p>During the meet and greet:</p>" +
    "<ul>" +
    "<li>Watch how the person handles and talks about the cat.</li>" +
    "<li>Listen for plans that sound unsafe or do not match FKR policies.</li>" +
    "<li>If you feel uneasy or unsure, treat it as a concern and pause to talk with staff.</li>" +
    "</ul>",

  decision:
    "<p>If they clearly chose a specific cat today, pick <strong>Yes</strong> and move into the adoption steps.</p>" +
    "<p>If they are still thinking, left without choosing, or want to come back another day, pick <strong>No</strong>.</p>",

  adopt_main_create_person:
    "<p><strong>If the adopter may already be in PetPoint:</strong></p>" +
    "<ol>" +
    "<li>Search by name, email, and phone.</li>" +
    "<li>If you find a match, confirm address, phone, and email.</li>" +
    "<li>If you are sure they are new, go to <em>Need to create Person</em>.</li>" +
    "</ol>",

  no_adopt_create_person:
    "<p><strong>For a walk-in or no-adoption visit:</strong></p>" +
    "<ol>" +
    "<li>Search first to avoid duplicate Person records.</li>" +
    "<li>If they are new, create a Person so you can upload the consultation form and add notes.</li>" +
    "</ol>",

  create_person:
    "<p><strong>Create new Person:</strong></p>" +
    "<ol>" +
    "<li>On the People tab, click the green plus to create a new Person.</li>" +
    "<li>Enter full name, phone, and email. Include address if available.</li>" +
    "<li>Save the record and use this Person for all outcomes, memos, and receipts.</li>" +
    "</ol>",

  adopt_main_1:
    "<p><strong>PetPoint Person record:</strong></p>" +
    "<ol>" +
    "<li>Search by name, email, or phone.</li>" +
    "<li>If a record exists, confirm address, phone, and email.</li>" +
    "<li>If needed, create a new record with complete contact info.</li>" +
    "<li>Check that there are no duplicate records for this person.</li>" +
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
    "<button class='help-detail' data-subhelp='adopt_outcome_multi'>Multi-cat outcome example</button>",

  adopt_main_3:
    "<p><strong>Vouchers:</strong></p>" +
    "<ol>" +
    "<li>Confirm which voucher each cat should receive.</li>" +
    "<li>On the cat record, create the voucher and link it to the adoption.</li>" +
    "<li>Check that Type, Subtype, and Issued/Expiry dates are correct.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='voucher_cat'>Show voucher example on cat</button>",

  adopt_main_4:
    "<p><strong>Microchip and wellness option:</strong></p>" +
    "<ol>" +
    "<li>Confirm the microchip number is in the cat record.</li>" +
    "<li>Explain how registration works and why it matters.</li>" +
    "<li>Review the Petco or other wellness option and let the adopter choose.</li>" +
    "<li>Record their choice and consent where required.</li>" +
    "</ol>",

  adopt_main_5:
    "<p><strong>Folder ADA forms:</strong></p>" +
    "<ol>" +
    "<li>Pull the correct red folder for this cat or group of cats.</li>" +
    "<li>Go through each ADA and explain any special notes or restrictions.</li>" +
    "<li>Answer questions and confirm understanding.</li>" +
    "<li>Have the adopter sign where required and check that every required signature is present.</li>" +
    "</ol>",

  adopt_main_6:
    "<p><strong>Contract:</strong></p>" +
    "<ol>" +
    "<li>From the completed adoption outcome, open the contract print option.</li>" +
    "<li>Print or display the contract for the adopter to sign.</li>" +
    "<li>Follow your normal workflow for emailing the signed copy to the adopter.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='contract_print'>Show where to print contract</button>",

  adopt_main_7:
    "<p><strong>Payment:</strong></p>" +
    "<ol>" +
    "<li>Fill out the payment slip with correct fees and discounts.</li>" +
    "<li>Take payment using the approved method.</li>" +
    "<li>Record payment in PetPoint under the correct adopter.</li>" +
    "<li>Confirm the balance shows as paid.</li>" +
    "</ol>",

  adopt_after:
    "<p><strong>Before they leave:</strong></p>" +
    "<ul>" +
    "<li>Put together the adoption bag.</li>" +
    "<li>Add litter sample if you have it.</li>" +
    "<li>Record kitten weight where needed.</li>" +
    "<li>Scan the cat to confirm microchip.</li>" +
    "<li>Offer the kennel card or printed photo if that is standard.</li>" +
    "</ul>",

  after_leave:
    "<p><strong>Adopter memo on person:</strong></p>" +
    "<ol>" +
    "<li>Open the <strong>Person</strong> record for the adopter.</li>" +
    "<li>Add a new memo with Type <strong>Adoption Outcome</strong> and Subtype <strong>Adopted</strong>.</li>" +
    "<li>Note any key facts about the appointment that will help if they call later.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='adopter_memo'>Show adopter memo example</button>",

  after_memo_cat:
    "<p><strong>Cat outcome memo:</strong></p>" +
    "<ol>" +
    "<li>Open the cat's record.</li>" +
    "<li>Add a new memo with Type <strong>Outcome</strong> and Subtype <strong>Adoption</strong>.</li>" +
    "<li>Add a short note such as where the cat went and if they will join other pets.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='cat_memo'>Show cat memo example</button>",

  after_association:
    "<p><strong>Update association:</strong></p>" +
    "<ol>" +
    "<li>On the person record, open the Associations tab.</li>" +
    "<li>Add a new association for <strong>Adopter</strong>.</li>" +
    "<li>Use the same Subtype that was on their Potential Adopter association (for example, FKR Website).</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='association_new'>Show association example</button>",

  after_upload_ada:
    "<p><strong>Upload ADA forms and use correct naming:</strong></p>" +
    "<ol>" +
    "<li>Scan or photograph the signed ADA pages.</li>" +
    "<li>On the cat record, go to <strong>Memos/Files</strong> and click the green plus next to Files.</li>" +
    "<li>Use the naming and Type/Subtype rules in the step description.</li>" +
    "</ol>",

  after_upload_consult:
    "<p><strong>Upload consultation form:</strong></p>" +
    "<ol>" +
    "<li>Scan or photograph the consult form if not already done.</li>" +
    "<li>On the person record, upload the file to their Memos/Files area.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='consult_upload'>Consultation form upload screen</button>",

  after_receipt:
    "<p><strong>Enter the receipt:</strong></p>" +
    "<ol>" +
    "<li>From the person record, use the green plus menu to create a new <strong>Receipt</strong>.</li>" +
    "<li>On the Receipt - New screen, set the cash drawer and reference as your group uses them.</li>" +
    "<li>Add the adoption item based on age and link the correct cat.</li>" +
    "<li>When you click Pay, fill out the payment panel. Select Cash as the type if that is your standard, even when using Square, and note card details in the reference.</li>" +
    "</ol>" +
    "<button class='help-detail' data-subhelp='receipt_new'>How to create new receipt</button>" +
    "<button class='help-detail' data-subhelp='receipt_screen'>Receipt - New screen example</button>" +
    "<button class='help-detail' data-subhelp='receipt_multi'>Multi-cat receipt example</button>",

  after_calendar:
    "<p><strong>Update the calendar:</strong></p>" +
    "<ol>" +
    "<li>Open the original appointment on the calendar.</li>" +
    "<li>Mark it as completed and note that the cat was adopted.</li>" +
    "<li>Use your standard wording for no-show, reschedule, or completed adoption.</li>" +
    "</ol>",

  after_photo:
    "<p><strong>Photo to Kim:</strong></p>" +
    "<ol>" +
    "<li>Choose a clear photo of adopter and cat.</li>" +
    "<li>Text the photo to Kim using the rescue's standard number or thread.</li>" +
    "<li>Confirm guidelines about faces, minors, and social media have been followed.</li>" +
    "</ol>",

  after_email:
    "<p><strong>Outlook Adoption Email:</strong></p>" +
    "<ol>" +
    "<li>Open Outlook and click <em>New Message</em>.</li>" +
    "<li>In <strong>BCC</strong>, enter <em>Adoption Notification</em>. Leave the To and CC lines blank.</li>" +
    "<li>Subject line: type the name(s) of the cat(s) adopted.</li>" +
    "<li>In the message body, list the cat name(s), note that <em>PP done</em>, and indicate if the photo was sent.</li>" +
    "<li>At the end of the message, include the names of the adoption counselors working that day.</li>" +
    "</ol>",

  after_whiteboard:
    "<p><strong>Whiteboards:</strong></p>" +
    "<ol>" +
    "<li>Update any room or lobby boards that track which cats are available or adopted.</li>" +
    "<li>Erase the adopted cat from available lists.</li>" +
    "<li>Add any new notes that are part of your standard process.</li>" +
    "</ol>",

  no_adopt:
    "<p><strong>If no cat was adopted:</strong></p>" +
    "<ol>" +
    "<li>If something felt concerning or needs more review, add a <em>Future adopt - needs discussion</em> memo.</li>" +
    "<li>If this was a walk in, scan and upload the consultation form to the person record.</li>" +
    "<li>Update the calendar with the correct no adoption reason.</li>" +
    "</ol>",

  stop_staff:
    "<p><strong>When you have a concern:</strong></p>" +
    "<ol>" +
    "<li>End the visit kindly and step out of the room.</li>" +
    "<li>Find a staff member and explain what you saw or heard.</li>" +
    "<li>Follow staff direction before you schedule or approve anything else with this adopter.</li>" +
    "</ol>",

  done:
    "<p>This means you have finished all required tasks for this case.</p>" +
    "<p>You can tap <strong>Start again</strong> when you are ready to begin the checklist for the next adopter.</p>"
};

// Second level help with screenshots only
const subHelpContent = {
  adopt_outcome_start: {
    title: "Where to start Outcome on person",
    html: "<img src='1-create-new-outcome-on-person.png' alt='Add Outcome from green plus menu on person' class='help-image' data-zoom>"
  },
  adopt_outcome_fields: {
    title: "Outcome - New fields example",
    html: "<img src='2-outcome-form-filled.png' alt='Outcome New form filled example' class='help-image' data-zoom>"
  },
  adopt_outcome_multi: {
    title: "Multi-cat outcome example",
    html: "<img src='1-multiple-cat-outcome-on-person.png' alt='Multi-cat outcome on person' class='help-image' data-zoom>"
  },
  voucher_cat: {
    title: "Voucher on cat example",
    html: "<img src='3-voucher-on-cat.png' alt='Voucher Automatic screen on cat' class='help-image' data-zoom>"
  },
  contract_print: {
    title: "Where to print contract",
    html: "<img src='4-create-contract-on-person-outcome.png' alt='Contract print option on adoption outcome' class='help-image' data-zoom>"
  },
  adopter_memo: {
    title: "Adopter memo on person",
    html: "<img src='5-Adopter-memo.png' alt='Adoption Outcome memo on person' class='help-image' data-zoom>"
  },
  cat_memo: {
    title: "Cat outcome memo",
    html: "<img src='7-memo-on-pet.png' alt='Outcome memo on pet' class='help-image' data-zoom>"
  },
  association_new: {
    title: "Association - new example",
    html: "<img src='6-Association.png' alt='Association New screen with instructions' class='help-image' data-zoom>"
  },
  receipt_new: {
    title: "How to create new receipt",
    html: "<img src='8-new-receipt-on-person.png' alt='New receipt from person record' class='help-image' data-zoom>"
  },
  receipt_screen: {
    title: "Receipt - New screen example",
    html: "<img src='9-receipt-form.png' alt='Receipt form and payment panel' class='help-image' data-zoom>"
  },
  receipt_multi: {
    title: "Multi-cat receipt example",
    html: "<img src='8-multi-cat-receipt-on-person.png' alt='Multi-cat receipt on person' class='help-image' data-zoom>"
  },
  consult_upload: {
    title: "Consultation form upload screen",
    html: "<img src='10-Consultation-Form.png' alt='Consultation form upload screen' class='help-image' data-zoom>"
  }
};

let currentHelpStep = null;

// Lightbox for zooming screenshots
let lightboxOverlay = null;

function ensureLightbox() {
  if (lightboxOverlay) return;
  lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  lightboxOverlay.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" type="button">Close</button>
      <img src="" alt="Zoomed screenshot">
    </div>
  `;
  document.body.appendChild(lightboxOverlay);

  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox-close') || e.target === lightboxOverlay) {
      lightboxOverlay.classList.remove('active');
    }
  });
}

function openLightbox(src, alt) {
  ensureLightbox();
  const img = lightboxOverlay.querySelector('img');
  img.src = src;
  img.alt = alt || 'Zoomed screenshot';
  lightboxOverlay.classList.add('active');
}

// Build map of step labels from DOM
function buildStepLabels() {
  orderedStepIds.forEach(id => {
    const el = document.querySelector(`.step[data-step-id="${id}"] .step-title`);
    stepLabels[id] = el ? el.textContent.trim() : id;
  });
}

// Update the JumpTo dropdown with numbered steps and checkmarks
function updateJumpOptions() {
  if (!stepJumpSelect) return;

  const placeholderText = 'Jump to step…';
  stepJumpSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = placeholderText;
  stepJumpSelect.appendChild(placeholder);

  orderedStepIds.forEach((id, idx) => {
    const opt = document.createElement('option');
    opt.value = id;
    const num = idx + 1;
    const label = stepLabels[id] || id;
    const done = completedSteps.has(id);
    opt.textContent = (done ? '✔ ' : '') + num + '. ' + label;
    stepJumpSelect.appendChild(opt);
  });
}

function setInteraction(type) {
  interactionType = type;
  if (type === 'appointment') {
    goTo('prep_appointment');
  } else {
    goTo('prep_walkin');
  }
}

// When leaving receipt, send to different next step based on appointment vs walk-in
function goToAfterReceiptNext() {
  if (interactionType === 'walkin') {
    goTo('after_photo');
  } else {
    goTo('after_calendar');
  }
}

// From create_person, return to the correct next step based on what path we came from
function goToFromCreatePerson() {
  if (createPersonReturnTarget === 'adopt') {
    goTo('adopt_main_1');
  } else if (createPersonReturnTarget === 'no_adopt') {
    goTo('no_adopt');
  } else {
    goTo('start');
  }
}

function jumpToStep(id) {
  if (!id) return;
  goTo(id);
  stepJumpSelect.value = '';
}

function showStep(id) {
  steps.forEach(step => {
    step.classList.toggle('active', step.dataset.stepId === id);
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

// Main navigation
function goTo(id, reset = false) {
  const last = historyStack[historyStack.length - 1];

  if (reset) {
    historyStack.length = 0;
    historyStack.push(id);
    completedSteps.clear();
  } else {
    // Mark the step we are leaving as completed
    if (last && last !== id) {
      completedSteps.add(last);
    }

    // Special: entering create_person from adoption or no_adopt paths
    if (id === 'create_person') {
      if (last === 'adopt_main_create_person') {
        createPersonReturnTarget = 'adopt';
      } else if (last === 'no_adopt_create_person') {
        createPersonReturnTarget = 'no_adopt';
      }
    }

    if (last !== id) {
      historyStack.push(id);
    }
  }

  showStep(id);
  updateJumpOptions();
}

function goBack() {
  if (historyStack.length > 1) {
    const popped = historyStack.pop();
    completedSteps.add(popped);
    showStep(historyStack[historyStack.length - 1]);
  } else {
    showStep("start");
  }
  updateJumpOptions();
}

// Help overlay controls
function showHelp(stepId) {
  currentHelpStep = stepId;
  const overlay = document.getElementById("help-overlay");
  const titleEl = document.getElementById("help-title");
  const textEl = document.getElementById("help-text");
  const backBtn = document.getElementById("help-back-btn");

  const defaultTitle = "Step help";
  const defaultText = "If you are unsure what to do on this step, pause and ask a staff member for guidance.";

  let title = defaultTitle;
  let text = helpContent[stepId] || defaultText;

  const stepEl = document.querySelector('.step[data-step-id="' + stepId + '"] .step-title');
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
  const overlay = document.getElementById("help-overlay");
  const titleEl = document.getElementById("help-title");
  const textEl = document.getElementById("help-text");
  const backBtn = document.getElementById("help-back-btn");

  const data = subHelpContent[subId];
  if (!data) return;

  titleEl.textContent = data.title || "More details";
  textEl.innerHTML = data.html || "";
  backBtn.style.display = currentHelpStep ? "inline-flex" : "none";

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  // Wire up zoom on any help images
  const img = textEl.querySelector('img[data-zoom]');
  if (img) {
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    }, { once: true });
  }
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

// Watch for clicks on detail buttons inside the help card
document.getElementById("help-card").addEventListener("click", function (e) {
  const btn = e.target.closest("[data-subhelp]");
  if (!btn) return;
  const subId = btn.getAttribute("data-subhelp");
  showSubHelp(subId);
});

// Initial setup
buildStepLabels();
showStep("start");
updateJumpOptions();
