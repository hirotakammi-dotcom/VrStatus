
const VR_ICON = `
<svg viewBox="0 0 24 24"
     width="18" height="18"
     xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor"
    d="M4 7h16a3 3 0 0 1 3 3v7a3
    3 0 0 1-3 3h-4l-4-3-4 3H4a3
    3 0 0 1-3-3v-7a3 3 0 0 1 3-3zm2
    4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm12
    0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
</svg>`;

const STYLE_ID = "vrstatus-style";

const CSS = `
.vrstatus-indicator {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #23a55a;
  border: 3px solid var(--background-primary, #313338);
  border-radius: 50%;
  z-index: 10;
  pointer-events: none;
}
.vrstatus-indicator svg {
  width: 12px;
  height: 12px;
}
`;

let observer = null;
let enabled = false;

function createStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function addIndicator(avatar) {
  if (!avatar || avatar.querySelector(".vrstatus-indicator")) {
    return;
  }

  const wrapper = avatar.parentElement;
  if (!wrapper) return;

  if (getComputedStyle(wrapper).position === "static") {
    wrapper.style.position = "relative";
    wrapper.dataset.vrstatusPosition = "true";
  }

  const indicator = document.createElement("span");
  indicator.className = "vrstatus-indicator";
  indicator.innerHTML = VR_ICON;
  indicator.setAttribute("aria-label", "VR indicator");
  indicator.title = "VR indicator (local visual only)";

  wrapper.appendChild(indicator);
}

function removeIndicators() {
  document.querySelectorAll(".vrstatus-indicator")
    .forEach(element => element.remove());

  document.querySelectorAll(
    '[data-vrstatus-position="true"]'
  ).forEach(element => {
    element.style.position = "";
    delete element.dataset.vrstatusPosition;
  });
}

function scanAvatars() {
  if (!enabled) return;

  const avatars = document.querySelectorAll(
    'img[class*="avatar"], [class*="avatar"] img'
  );

  avatars.forEach(addIndicator);
}

function start() {
  if (enabled) return;

  enabled = true;
  createStyle();
  scanAvatars();

  observer = new MutationObserver(() => {
    scanAvatars();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function stop() {
  enabled = false;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  removeIndicators();

  document.getElementById(STYLE_ID)?.remove();
}

module.exports = {
  onLoad() {
    start();
  },

  onUnload() {
    stop();
  }
};
