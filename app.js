/**
 * ENTERPRISE FOLDER DELETION UTILITY
 * Core Application & Bureaucratic Wizard Logic
 */

// Global State
const state = {
  folders: [
    {
      id: 'f1',
      name: 'College Project',
      path: 'C:\\Users\\DELL\\Desktop\\College Project',
      files: 37,
      size: '248 MB',
      created: '12/08/2026',
      deleted: false
    },
    {
      id: 'f2',
      name: 'Tax Documents 2021-2025',
      path: 'C:\\Users\\DELL\\Documents\\Financials\\Tax Documents 2021-2025',
      files: 142,
      size: '1.2 GB',
      created: '03/15/2025',
      deleted: false
    },
    {
      id: 'f3',
      name: 'Super Secret Folder',
      path: 'C:\\Users\\DELL\\Desktop\\Super Secret Folder',
      files: 9,
      size: '14.8 MB',
      created: '01/10/2026',
      deleted: false
    },
    {
      id: 'f4',
      name: 'Final_Final_v2_FINAL(1)',
      path: 'C:\\Users\\DELL\\Projects\\Final_Final_v2_FINAL(1)',
      files: 88,
      size: '412 MB',
      created: '08/22/2026',
      deleted: false
    },
    {
      id: 'f5',
      name: 'Memes (Do Not Open)',
      path: 'C:\\Users\\DELL\\Pictures\\Memes (Do Not Open)',
      files: 1240,
      size: '3.4 GB',
      created: '11/04/2024',
      deleted: false
    }
  ],
  auditLog: [],
  stats: {
    attempts: 0,
    questionsAnswered: 0,
    totalSecondsWasted: 0
  },
  currentWizard: {
    active: false,
    folderId: null,
    step: 1,
    totalSteps: 16,
    startTime: null,
    timerInterval: null,
    timerSeconds: 10
  }
};

// DOM References
const DOM = {
  folderList: document.getElementById('folder-list'),
  folderCount: document.getElementById('folder-count'),
  searchInput: document.getElementById('folder-search'),
  btnAddFolder: document.getElementById('btn-add-folder'),
  btnViewLogs: document.getElementById('btn-view-logs'),
  auditPanel: document.getElementById('audit-log-panel'),
  btnCloseLog: document.getElementById('btn-close-log'),
  logList: document.getElementById('log-list'),
  statAttempts: document.getElementById('stat-attempts'),
  statQuestions: document.getElementById('stat-questions'),
  statTime: document.getElementById('stat-time'),
  
  // Wizard Modal Elements
  modalWizard: document.getElementById('modal-wizard'),
  wizardHeaderTitle: document.getElementById('wizard-header-title'),
  wizardStepIndicator: document.getElementById('wizard-step-indicator'),
  wizardProgress: document.getElementById('wizard-progress'),
  targetFolderName: document.getElementById('target-folder-name'),
  targetFolderPath: document.getElementById('target-folder-path'),
  wizardBody: document.getElementById('wizard-body'),
  wizardFooter: document.getElementById('wizard-footer'),
  wizardBtnCancel: document.getElementById('wizard-btn-cancel'),
  wizardBtnBack: document.getElementById('wizard-btn-back'),
  wizardBtnNext: document.getElementById('wizard-btn-next'),
  wizardBtnClose: document.getElementById('wizard-btn-close'),
  
  // Add Folder Modal Elements
  modalAddFolder: document.getElementById('modal-add-folder'),
  formAddFolder: document.getElementById('form-add-folder'),
  addModalClose: document.getElementById('add-modal-close'),
  addModalCancel: document.getElementById('add-modal-cancel')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderFolderList();
  setupEventListeners();
});

// Render Main Folder List
function renderFolderList(filter = '') {
  DOM.folderList.innerHTML = '';
  const filtered = state.folders.filter(f => 
    !f.deleted && f.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  DOM.folderCount.textContent = filtered.length;

  if (filtered.length === 0) {
    DOM.folderList.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted);">
        No active folders found matching your query. All folders may have been safe... for now.
      </div>
    `;
    return;
  }

  filtered.forEach(folder => {
    const item = document.createElement('div');
    item.className = 'folder-item';
    item.innerHTML = `
      <div class="folder-main-info">
        <span class="folder-icon">📁</span>
        <div class="folder-details">
          <span class="folder-name">${escapeHTML(folder.name)}</span>
          <span class="folder-path">${escapeHTML(folder.path)}</span>
          <div class="folder-meta-tags">
            <span>📄 Files: <strong>${folder.files}</strong></span>
            <span>💾 Size: <strong>${folder.size}</strong></span>
            <span>📅 Created: <strong>${folder.created}</strong></span>
          </div>
        </div>
      </div>
      <div class="folder-actions">
        <button class="btn btn-danger btn-delete-folder" data-id="${folder.id}">Delete Folder</button>
      </div>
    `;
    DOM.folderList.appendChild(item);
  });

  // Attach delete buttons
  document.querySelectorAll('.btn-delete-folder').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      startDeletionWizard(id);
    });
  });
}

// Setup Event Listeners
function setupEventListeners() {
  // Search Input
  DOM.searchInput.addEventListener('input', (e) => {
    renderFolderList(e.target.value);
  });

  // Log Panel Toggle
  DOM.btnViewLogs.addEventListener('click', () => {
    DOM.auditPanel.classList.toggle('hidden');
  });
  DOM.btnCloseLog.addEventListener('click', () => {
    DOM.auditPanel.classList.add('hidden');
  });

  // Add Custom Folder Modal
  DOM.btnAddFolder.addEventListener('click', () => {
    DOM.modalAddFolder.classList.remove('hidden');
  });
  DOM.addModalClose.addEventListener('click', () => {
    DOM.modalAddFolder.classList.add('hidden');
  });
  DOM.addModalCancel.addEventListener('click', () => {
    DOM.modalAddFolder.classList.add('hidden');
  });

  DOM.formAddFolder.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-folder-name').value.trim();
    const path = document.getElementById('new-folder-path').value.trim();
    const files = parseInt(document.getElementById('new-folder-files').value, 10) || 1;
    const size = document.getElementById('new-folder-size').value.trim();

    if (name && path) {
      const newFolder = {
        id: 'f_' + Date.now(),
        name,
        path,
        files,
        size,
        created: new Date().toLocaleDateString('en-US'),
        deleted: false
      };
      state.folders.push(newFolder);
      renderFolderList();
      DOM.modalAddFolder.classList.add('hidden');
      DOM.formAddFolder.reset();
    }
  });

  // Wizard General Navigation
  DOM.wizardBtnClose.addEventListener('click', cancelWizard);
  DOM.wizardBtnCancel.addEventListener('click', cancelWizard);
  
  DOM.wizardBtnBack.addEventListener('click', () => {
    if (state.currentWizard.step > 1) {
      state.currentWizard.step--;
      renderWizardStep();
    }
  });

  DOM.wizardBtnNext.addEventListener('click', handleWizardNext);
}

// Start Multi-Step Deletion Wizard
function startDeletionWizard(folderId) {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;

  state.currentWizard = {
    active: true,
    folderId: folderId,
    step: 1,
    totalSteps: 16,
    startTime: Date.now(),
    timerInterval: null,
    timerSeconds: 10
  };

  state.stats.attempts++;

  DOM.targetFolderName.textContent = folder.name;
  DOM.targetFolderPath.textContent = folder.path;
  DOM.modalWizard.classList.remove('hidden');

  renderWizardStep();
}

// Cancel Wizard
function cancelWizard() {
  if (state.currentWizard.timerInterval) {
    clearInterval(state.currentWizard.timerInterval);
  }
  
  logAuditEntry('CANCELLED', 'User abandoned folder deletion wizard at step ' + state.currentWizard.step);
  state.currentWizard.active = false;
  DOM.modalWizard.classList.add('hidden');
}

// Handle Wizard "Continue / Next" Button
function handleWizardNext() {
  const currentStep = state.currentWizard.step;

  // Custom step validation before advancing
  if (!validateCurrentStep(currentStep)) {
    return;
  }

  state.stats.questionsAnswered++;

  if (currentStep < state.currentWizard.totalSteps) {
    state.currentWizard.step++;
    renderWizardStep();
  } else if (currentStep === state.currentWizard.totalSteps) {
    // Move to Execution / Loading (Step 17)
    executeDeletionLoading();
  }
}

// Step Validation Logic
function validateCurrentStep(step) {
  switch(step) {
    case 3: {
      const chk = document.getElementById('step3-checkbox');
      return chk && chk.checked;
    }
    case 4: {
      const selected = document.querySelector('input[name="step4-reason"]:checked');
      return !!selected;
    }
    case 5: {
      const selected = document.querySelector('input[name="step5-attachment"]:checked');
      return !!selected;
    }
    case 6: {
      const selected = document.querySelector('input[name="step6-emotion"]:checked');
      return !!selected;
    }
    case 7: {
      return state.currentWizard.timerSeconds <= 0;
    }
    case 8: {
      const input = document.getElementById('step8-input');
      const requiredText = "I AGREE TO PERMANENTLY ERASE THIS FOLDER AND ALL OF ITS HAPPINESS";
      if (!input || input.value.trim() !== requiredText) {
        showValidationError('step8-error', 'Text must match the verification phrase exactly.');
        return false;
      }
      return true;
    }
    case 9: {
      const input = document.getElementById('step9-input');
      if (!input || input.value.trim() !== '65') {
        showValidationError('step9-error', 'Incorrect math answer. Corporate requires accurate calculations.');
        return false;
      }
      return true;
    }
    case 10: {
      const chks = document.querySelectorAll('.step10-chk');
      let allChecked = true;
      chks.forEach(c => { if (!c.checked) allChecked = false; });
      if (!allChecked) {
        showValidationError('step10-error', 'You must confirm all 3 backup requirements to proceed.');
        return false;
      }
      return true;
    }
    case 12: {
      const chk = document.getElementById('step12-chk');
      if (!chk || !chk.checked) {
        showValidationError('step12-error', 'You must scroll to the bottom and check the agreement box.');
        return false;
      }
      return true;
    }
    case 16: {
      const input = document.getElementById('step16-input');
      if (!input || input.value.trim() !== 'DELETE') {
        showValidationError('step16-error', 'You must type DELETE in all capital letters.');
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

function showValidationError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

// Render Specific Wizard Step
function renderWizardStep() {
  const step = state.currentWizard.step;
  const total = state.currentWizard.totalSteps;

  // Clear timer if present
  if (state.currentWizard.timerInterval) {
    clearInterval(state.currentWizard.timerInterval);
  }

  // Update Header & Progress
  DOM.wizardStepIndicator.textContent = `Step ${step} of ${total}`;
  const pct = Math.round((step / total) * 100);
  DOM.wizardProgress.style.width = `${pct}%`;

  // Control Back button visibility
  if (step > 1) {
    DOM.wizardBtnBack.classList.remove('hidden');
  } else {
    DOM.wizardBtnBack.classList.add('hidden');
  }

  // Reset Next button state
  DOM.wizardBtnNext.disabled = false;
  DOM.wizardBtnNext.textContent = 'Continue →';
  DOM.wizardBtnNext.className = 'btn btn-primary';
  DOM.wizardFooter.classList.remove('hidden');

  const folder = state.folders.find(f => f.id === state.currentWizard.folderId);
  const folderName = folder ? folder.name : 'Target Folder';

  // Render Body HTML based on Step
  switch (step) {
    case 1:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Are you sure you want to delete this folder?</h4>
        <p class="wizard-question-subtitle">
          You are about to initiate deletion for <strong>${escapeHTML(folderName)}</strong>. Please verify that this action is intentional.
        </p>
      `;
      break;

    case 2:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Are you really sure?</h4>
        <p class="wizard-question-subtitle">
          Secondary verification check. Mistakes happen when clicking too fast. Take a second to think.
        </p>
      `;
      break;

    case 3:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">You understand that this folder will be deleted?</h4>
        <p class="wizard-question-subtitle">
          Please acknowledge the permanent operational outcome of this request.
        </p>
        <div class="options-list">
          <label class="option-item">
            <input type="checkbox" id="step3-checkbox">
            <span class="option-label">I understand that this folder and all <strong>${folder ? folder.files : 37}</strong> enclosed files will be deleted.</span>
          </label>
        </div>
      `;
      DOM.wizardBtnNext.disabled = true;
      document.getElementById('step3-checkbox').addEventListener('change', (e) => {
        DOM.wizardBtnNext.disabled = !e.target.checked;
      });
      break;

    case 4:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Why do you want to delete this folder?</h4>
        <p class="wizard-question-subtitle">Corporate storage management policy requires categorization of all deleted assets.</p>
        <div class="options-list">
          <label class="option-item"><input type="radio" name="step4-reason" value="not_needed"> <span class="option-label">I don't need it</span></label>
          <label class="option-item"><input type="radio" name="step4-reason" value="useless"> <span class="option-label">It's useless</span></label>
          <label class="option-item"><input type="radio" name="step4-reason" value="space"> <span class="option-label">It's taking space</span></label>
          <label class="option-item"><input type="radio" name="step4-reason" value="mistake"> <span class="option-label">I made a mistake</span></label>
          <label class="option-item"><input type="radio" name="step4-reason" value="other"> <span class="option-label">Other (specify below)</span></label>
        </div>
        <input type="text" id="step4-other-text" class="form-input hidden" placeholder="Please elaborate on your rationale...">
      `;
      document.querySelectorAll('input[name="step4-reason"]').forEach(r => {
        r.addEventListener('change', (e) => {
          const otherInput = document.getElementById('step4-other-text');
          if (e.target.value === 'other') {
            otherInput.classList.remove('hidden');
          } else {
            otherInput.classList.add('hidden');
          }
        });
      });
      break;

    case 5:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">How emotionally attached are you to this folder?</h4>
        <p class="wizard-question-subtitle">We conduct mandatory psychological impact screening prior to file destruction.</p>
        <div class="options-list">
          <label class="option-item"><input type="radio" name="step5-attachment" value="none"> <span class="option-label">Not at all</span></label>
          <label class="option-item"><input type="radio" name="step5-attachment" value="slight"> <span class="option-label">Slightly</span></label>
          <label class="option-item"><input type="radio" name="step5-attachment" value="very"> <span class="option-label">Very</span></label>
          <label class="option-item"><input type="radio" name="step5-attachment" value="complicated"> <span class="option-label">It's complicated</span></label>
        </div>
      `;
      break;

    case 6:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">What was your primary emotion when you created this folder?</h4>
        <p class="wizard-question-subtitle">Retrospective sentiment audit for IT analytics.</p>
        <div class="options-list">
          <label class="option-item"><input type="radio" name="step6-emotion" value="optimism"> <span class="option-label">Optimism & Ambition</span></label>
          <label class="option-item"><input type="radio" name="step6-emotion" value="panic"> <span class="option-label">Impending Deadline Panic</span></label>
          <label class="option-item"><input type="radio" name="step6-emotion" value="confusion"> <span class="option-label">Mild Confusion</span></label>
          <label class="option-item"><input type="radio" name="step6-emotion" value="caffeine"> <span class="option-label">Caffeine-Induced Mania</span></label>
        </div>
      `;
      break;

    case 7:
      state.currentWizard.timerSeconds = 10;
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Mandatory Reflection Period</h4>
        <p class="wizard-question-subtitle">
          Corporate regulations mandate a 10-second cool-off pause to prevent rash decisions. Please stare at the timer and reflect.
        </p>
        <div class="timer-box">
          <span class="timer-number" id="reflection-timer">10</span>
          <span class="help-text">Seconds remaining before button unlocks...</span>
        </div>
      `;
      DOM.wizardBtnNext.disabled = true;
      
      state.currentWizard.timerInterval = setInterval(() => {
        state.currentWizard.timerSeconds--;
        const timerEl = document.getElementById('reflection-timer');
        if (timerEl) {
          timerEl.textContent = state.currentWizard.timerSeconds;
        }
        if (state.currentWizard.timerSeconds <= 0) {
          clearInterval(state.currentWizard.timerInterval);
          DOM.wizardBtnNext.disabled = false;
          if (timerEl) timerEl.textContent = '0 (Unlocked)';
        }
      }, 1000);
      break;

    case 8:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Security Verification Phrase</h4>
        <p class="wizard-question-subtitle">
          To prove you are an attentive human and not clicking out of muscle memory, type the exact phrase into the box:
        </p>
        <div class="verification-code-box">I AGREE TO PERMANENTLY ERASE THIS FOLDER AND ALL OF ITS HAPPINESS</div>
        <input type="text" id="step8-input" class="form-input" placeholder="Type the exact phrase above..." autocomplete="off">
        <span id="step8-error" class="validation-error hidden"></span>
      `;
      break;

    case 9:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Cognitive Sanity Check</h4>
        <p class="wizard-question-subtitle">
          Solve this mathematical equation to demonstrate you are operating with full logical reasoning:
        </p>
        <div class="math-problem">17 × 4 - 3 = ?</div>
        <input type="number" id="step9-input" class="form-input" placeholder="Enter answer..." style="max-width: 200px;">
        <span id="step9-error" class="validation-error hidden"></span>
      `;
      break;

    case 10:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Redundant Backup Verification</h4>
        <p class="wizard-question-subtitle">
          Storage Policy #404 requires 3 confirmed backups prior to file destruction. Please confirm all 3:
        </p>
        <div class="options-list">
          <label class="option-item">
            <input type="checkbox" class="step10-chk">
            <span class="option-label">I have exported a redundant copy to an external physical drive.</span>
          </label>
          <label class="option-item">
            <input type="checkbox" class="step10-chk">
            <span class="option-label">I have printed all files on paper and stored them in a fireproof binder.</span>
          </label>
          <label class="option-item">
            <input type="checkbox" class="step10-chk">
            <span class="option-label">I accept full emotional & administrative responsibility if I regret this in 5 minutes.</span>
          </label>
        </div>
        <span id="step10-error" class="validation-error hidden"></span>
      `;
      break;

    case 11:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Regret Minimization Assessment</h4>
        <p class="wizard-question-subtitle">Select any items in this folder you suspect you might regret losing next week:</p>
        <div class="options-list">
          <label class="option-item"><input type="checkbox" class="step11-item"> <span class="option-label">Unfinished draft document from 2022</span></label>
          <label class="option-item"><input type="checkbox" class="step11-item"> <span class="option-label">Useful code snippet you swore you'd reuse</span></label>
          <label class="option-item"><input type="checkbox" class="step11-item"> <span class="option-label">Sentimental screenshot of a zoom call</span></label>
          <label class="option-item"><input type="checkbox" class="step11-item"> <span class="option-label">File named <em>'New Document (1).txt'</em></span></label>
        </div>
        <div id="step11-warning" class="system-notice hidden" style="margin-top: 12px; background-color: #fff0f0; border-color: #ffcdd2;">
          <span class="notice-icon">⚠️</span>
          <span class="notice-text">Notice: Selecting items you might regret increases your Regret Index by +45%.</span>
        </div>
      `;
      document.querySelectorAll('.step11-item').forEach(c => {
        c.addEventListener('change', () => {
          const checkedAny = Array.from(document.querySelectorAll('.step11-item')).some(i => i.checked);
          const warn = document.getElementById('step11-warning');
          if (warn) {
            if (checkedAny) warn.classList.remove('hidden');
            else warn.classList.add('hidden');
          }
        });
      });
      break;

    case 12:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">End-User Folder Destruction License Agreement (EUFDLA)</h4>
        <p class="wizard-question-subtitle">You must scroll to the very bottom of the legalese terms before accepting.</p>
        <div class="legal-scroll-box" id="legal-box">
          <p><strong>SECTION 1.1: INTENT & PREAMBLE</strong><br>By initiating the destruction sequence for folder assets, the user (hereinafter "The Deleter") hereby acknowledges that bits and bytes erased from local storage rendered into magnetic non-existence shall not be resurrected by mere wishful thinking or complaints to IT support.</p>
          <p><strong>SECTION 1.2: WAIVER OF REGRET</strong><br>The Deleter agrees that Company, its affiliates, and the IT Department shall remain harmless against any sudden realization at 2:00 AM that crucial project files were contained within said folder.</p>
          <p><strong>SECTION 1.3: BUREAUCRATIC OVERSIGHT</strong><br>This deletion process has been subjected to 16 distinct confirmation steps to ensure that fatigue, impatience, or accidental double-clicking cannot be blamed on system design.</p>
          <p><strong>SECTION 1.4: FINAL ACKNOWLEDGMENT</strong><br>Scroll completed. You may now check the agreement checkbox below.</p>
        </div>
        <label class="option-item">
          <input type="checkbox" id="step12-chk" disabled>
          <span class="option-label">I have read all 14 sections of the EUFDLA and accept terms.</span>
        </label>
        <span id="step12-error" class="validation-error hidden"></span>
      `;

      const scrollBox = document.getElementById('legal-box');
      const chk = document.getElementById('step12-chk');
      scrollBox.addEventListener('scroll', () => {
        if (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 10) {
          chk.disabled = false;
        }
      });
      break;

    case 13:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Alternative Retention Options</h4>
        <p class="wizard-question-subtitle">Before permanent destruction, would you prefer one of these IT-recommended compromise options?</p>
        <div class="options-list">
          <button id="btn-opt-rename" class="btn btn-secondary" style="justify-content: flex-start; padding: 12px;">
            📁 <strong>Rename folder to "Archive_Do_Not_Touch"</strong> (Safest option)
          </button>
          <button id="btn-opt-move" class="btn btn-secondary" style="justify-content: flex-start; padding: 12px;">
            📦 <strong>Move to subfolder "Old Stuff"</strong> (Out of sight, out of mind)
          </button>
        </div>
        <p style="text-align: center; margin-top: 16px; font-size: 12px; color: var(--text-muted);">
          Or proceed below to reject all compromises.
        </p>
      `;

      document.getElementById('btn-opt-rename').addEventListener('click', () => {
        alert(`Folder "${folderName}" has been safely renamed to "${folderName}_ARCHIVED_DO_NOT_TOUCH". Deletion averted!`);
        logAuditEntry('COMPROMISED', `User chose compromise: Renamed folder '${folderName}'`);
        cancelWizard();
      });

      document.getElementById('btn-opt-move').addEventListener('click', () => {
        alert(`Folder "${folderName}" moved to C:\\Users\\DELL\\Desktop\\Old_Stuff\\${folderName}. Deletion averted!`);
        logAuditEntry('COMPROMISED', `User chose compromise: Moved folder '${folderName}'`);
        cancelWizard();
      });
      break;

    case 14:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Final Confirmation 1 of 3</h4>
        <p class="wizard-question-subtitle">Safeguard Level 1. Are you double sure you want to proceed?</p>
        <div class="system-notice">
          <span class="notice-icon">⚠️</span>
          <span class="notice-text">You are approaching the ultimate point of execution.</span>
        </div>
      `;
      break;

    case 15:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Final Confirmation 2 of 3</h4>
        <p class="wizard-question-subtitle">Safeguard Level 2. Are you triple sure? This is your penultimate chance to turn back.</p>
        <p style="font-size: 13px; color: var(--text-secondary);">
          If you click Continue, you will be required to type the final deletion command.
        </p>
      `;
      break;

    case 16:
      DOM.wizardBody.innerHTML = `
        <h4 class="wizard-question-title">Final Confirmation 3 of 3 (Ultimate Execution)</h4>
        <p class="wizard-question-subtitle">Point of no return. Type <strong>DELETE</strong> in all capital letters to initiate the deletion routine:</p>
        <input type="text" id="step16-input" class="form-input" placeholder="Type DELETE..." style="max-width: 200px;" autocomplete="off">
        <span id="step16-error" class="validation-error hidden"></span>
      `;
      DOM.wizardBtnNext.textContent = 'PERMANENTLY EXECUTE DELETION';
      DOM.wizardBtnNext.className = 'btn btn-danger';
      break;
  }
}

// Execute Deletion Progress (Step 17) & Results (Step 18)
function executeDeletionLoading() {
  DOM.wizardHeaderTitle.textContent = 'Executing Deletion Payload...';
  DOM.wizardStepIndicator.textContent = 'Processing...';
  DOM.wizardFooter.classList.add('hidden');
  DOM.wizardBtnBack.classList.add('hidden');

  DOM.wizardBody.innerHTML = `
    <div style="text-align: center; padding: 24px 0;">
      <h4 class="wizard-question-title">Deleting Folder...</h4>
      <p class="wizard-question-subtitle" id="loading-status-text">Initializing byte shredder...</p>
      
      <div class="progress-bar-container" style="height: 12px; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        <div id="loading-bar-fill" class="progress-bar-fill" style="width: 0%; background-color: var(--color-danger);"></div>
      </div>
      
      <span id="loading-percent" style="font-family: var(--font-mono); font-size: 16px; font-weight: 700;">0%</span>
    </div>
  `;

  let pct = 0;
  const bar = document.getElementById('loading-bar-fill');
  const txtPercent = document.getElementById('loading-percent');
  const txtStatus = document.getElementById('loading-status-text');

  const statuses = [
    { p: 15, msg: "Erasing file header references..." },
    { p: 40, msg: "Overwriting sectors with zeros..." },
    { p: 70, msg: "Consulting IT spirit guide for final clearance..." },
    { p: 99, msg: "Hanging at 99% for mandatory dramatic pause..." }
  ];

  const interval = setInterval(() => {
    if (pct < 99) {
      pct += Math.floor(Math.random() * 15) + 5;
      if (pct > 99) pct = 99;
      
      bar.style.width = `${pct}%`;
      txtPercent.textContent = `${pct}%`;

      const match = statuses.find(s => pct >= s.p);
      if (match) txtStatus.textContent = match.msg;
    } else {
      // Hang at 99% for 3 seconds before completion
      clearInterval(interval);
      setTimeout(() => {
        finishDeletionProcess();
      }, 3500);
    }
  }, 400);
}

// Finish Deletion Process & Show Outcome Certificate
function finishDeletionProcess() {
  const folder = state.folders.find(f => f.id === state.currentWizard.folderId);
  if (folder) {
    folder.deleted = true;
  }

  const durationSec = Math.round((Date.now() - state.currentWizard.startTime) / 1000);
  state.stats.totalSecondsWasted += durationSec;

  logAuditEntry('DELETED', `Successfully wasted ${durationSec}s deleting folder '${folder ? folder.name : 'Target'}' across 16 confirmation steps.`);
  updateStatsDisplay();

  DOM.wizardHeaderTitle.textContent = 'Folder Deletion Summary';
  DOM.wizardStepIndicator.textContent = 'Completed';
  DOM.wizardProgress.style.width = '100%';

  DOM.wizardBody.innerHTML = `
    <div style="text-align: center; padding: 12px 0;">
      <div style="font-size: 40px; margin-bottom: 8px;">🎉📁💥</div>
      <h4 class="wizard-question-title" style="color: var(--color-success);">Folder Deletion Complete!</h4>
      <p class="wizard-question-subtitle">
        Congratulations! You successfully endured all 16 bureaucratic verification steps.
      </p>

      <div class="card" style="border: 1px solid var(--border-color); padding: 16px; background-color: #fafbfc; text-align: left; margin: 16px 0;">
        <h5 style="font-size: 13px; font-weight: 600; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          OFFICIAL DELETION CERTIFICATE (#DEL-${Math.floor(Math.random()*89999+10000)})
        </h5>
        <div style="font-size: 12px; line-height: 1.6; font-family: var(--font-mono);">
          <div>• Target Folder: <strong>${folder ? escapeHTML(folder.name) : 'Folder'}</strong></div>
          <div>• Steps Passed: <strong>16 / 16</strong></div>
          <div>• Time Wasted: <strong>${durationSec} seconds</strong></div>
          <div>• Current Status: <span style="color: var(--color-danger); font-weight: 600;">Erased from active index</span></div>
          <div style="margin-top: 8px; font-size: 11px; color: var(--text-muted);">
            * Note: A backup copy has been automatically moved to <code>C:\\Recycle Bin\\Restored_Folders\\Do_Not_Delete</code> per IT compliance policy #402.
          </div>
        </div>
      </div>
    </div>
  `;

  DOM.wizardFooter.classList.remove('hidden');
  DOM.wizardBtnBack.classList.add('hidden');
  DOM.wizardBtnNext.textContent = 'Close & Return to Main Screen';
  DOM.wizardBtnNext.className = 'btn btn-primary';
  
  DOM.wizardBtnNext.onclick = () => {
    DOM.modalWizard.classList.add('hidden');
    renderFolderList();
    // Reset click handler back to default handleWizardNext
    DOM.wizardBtnNext.onclick = null;
    DOM.wizardBtnNext.addEventListener('click', handleWizardNext);
  };
}

// Audit Log Helpers
function logAuditEntry(status, details) {
  const timestamp = new Date().toLocaleTimeString();
  state.auditLog.unshift({ status, details, timestamp });
  
  // Render log
  DOM.logList.innerHTML = '';
  state.auditLog.forEach(log => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>[${log.timestamp}] [${log.status}]</strong> ${escapeHTML(log.details)}`;
    DOM.logList.appendChild(li);
  });
}

function updateStatsDisplay() {
  DOM.statAttempts.textContent = state.stats.attempts;
  DOM.statQuestions.textContent = state.stats.questionsAnswered;
  DOM.statTime.textContent = `${state.stats.totalSecondsWasted}s`;
}

// Security HTML Escaper
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
