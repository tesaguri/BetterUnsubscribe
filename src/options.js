/**
 * Default settings for BetterUnsubscribe
 */
const DEFAULT_SETTINGS = {
  autoSendEmail: false, // Don't automatically send emails by default
  confirmRegex: '', // No confirmation regex by default
};

/**
 * Logs messages to the console with a custom prefix.
 * @param {...any} args - The arguments to log to the console.
 */
function console_log(...args) {
  console.log('[BetterUnsubscribe][options.js]', ...args);
}

/**
 * Logs error messages to the console with a custom prefix.
 * @param {...any} args - The error arguments to log to the console.
 */
function console_error(...args) {
  console.error('[BetterUnsubscribe][options.js]', ...args);
}

/**
 * Validates a regular expression pattern
 * @param {string} pattern - The regex pattern to validate
 * @returns {{valid: boolean, error?: string}} - Validation result
 */
function validateRegex(pattern) {
  // Empty pattern is valid (means no confirmation)
  if (!pattern || pattern.trim() === '') {
    return { valid: true };
  }

  try {
    new RegExp(pattern, 'i');
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * Loads settings from storage and updates the UI
 */
async function loadSettings() {
  try {
    const settings = await messenger.storage.local.get(DEFAULT_SETTINGS);
    console_log('Loaded settings:', settings);

    document.getElementById('autoSendEmail').checked = settings.autoSendEmail;
    document.getElementById('confirmRegex').value = settings.confirmRegex;
  } catch (error) {
    console_error('Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

/**
 * Saves settings to storage
 */
async function saveSettings() {
  const autoSendEmail = document.getElementById('autoSendEmail').checked;
  const confirmRegex = document.getElementById('confirmRegex').value.trim();

  // Validate regex before saving
  const validation = validateRegex(confirmRegex);
  if (!validation.valid) {
    showStatus(
      `Invalid regular expression: ${validation.error}`,
      'error',
      5000
    );
    return;
  }

  const settings = {
    autoSendEmail,
    confirmRegex,
  };

  try {
    await messenger.storage.local.set(settings);
    console_log('Settings saved:', settings);
    showStatus(
      messenger.i18n.getMessage('settingsSaved') ||
        'Settings saved successfully!',
      'success',
      3000
    );
  } catch (error) {
    console_error('Error saving settings:', error);
    showStatus('Error saving settings', 'error', 5000);
  }
}

/**
 * Resets settings to defaults
 */
async function resetSettings() {
  try {
    await messenger.storage.local.set(DEFAULT_SETTINGS);
    console_log('Settings reset to defaults');

    // Update UI
    document.getElementById('autoSendEmail').checked =
      DEFAULT_SETTINGS.autoSendEmail;
    document.getElementById('confirmRegex').value =
      DEFAULT_SETTINGS.confirmRegex;

    showStatus(
      messenger.i18n.getMessage('settingsReset') ||
        'Settings reset to defaults',
      'success',
      3000
    );
  } catch (error) {
    console_error('Error resetting settings:', error);
    showStatus('Error resetting settings', 'error', 5000);
  }
}

/**
 * Shows a status message
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success' or 'error')
 * @param {number} duration - How long to show the message (ms), 0 = indefinite
 */
function showStatus(message, type = 'success', duration = 3000) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';

  if (duration > 0) {
    setTimeout(() => {
      status.style.display = 'none';
    }, duration);
  }
}

/**
 * Initialize the options page
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();

  // Set up event listeners
  document.getElementById('save').addEventListener('click', saveSettings);
  document.getElementById('reset').addEventListener('click', resetSettings);

  // Real-time regex validation
  const regexInput = document.getElementById('confirmRegex');
  regexInput.addEventListener('input', () => {
    const validation = validateRegex(regexInput.value.trim());
    if (!validation.valid && regexInput.value.trim() !== '') {
      regexInput.style.borderColor = 'red';
      regexInput.title = `Invalid regex: ${validation.error}`;
    } else {
      regexInput.style.borderColor = 'green';
      regexInput.title = '';
    }
  });
});
