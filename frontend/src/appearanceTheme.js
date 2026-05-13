export const VALID_APPEARANCE_SCHEMES = ['Forest', 'Ocean', 'Sunset'];

const APPEARANCE_GRADIENTS = {
  Forest: 'linear-gradient(180deg, #9DBF9E 85%, #005157 100%)',
  Ocean: 'linear-gradient(180deg, #87b9d8 85%, #0c4b78 100%)',
  Sunset: 'linear-gradient(180deg, #ffd36b 75%, #e4572e 100%)'
};

const APPEARANCE_GRADIENT_BOTTOM_COLORS = {
  Forest: '#005157',
  Ocean: '#0c4b78',
  Sunset: '#e4572e'
};

const APPEARANCE_CHROME_COLORS = {
  Forest: {
    nav: '#005157',
    navDisabled: '#00393d',
    footer: '#00444a',
    navButton: 'rgba(84, 199, 49, 0.3)',
    navButtonHover: 'rgba(255, 255, 255, 0.3)',
    navButtonActive: 'rgba(185, 24, 24, 0.3)'
  },
  Ocean: {
    nav: '#0c4b78',
    navDisabled: '#083353',
    footer: '#093a5e',
    navButton: 'rgba(84, 199, 49, 0.3)',
    navButtonHover: 'rgba(255, 255, 255, 0.3)',
    navButtonActive: 'rgba(185, 24, 24, 0.3)'
  },
  Sunset: {
    nav: '#d45a20',
    navDisabled: '#9f3f12',
    footer: '#b8421c',
    navButton: 'rgba(84, 199, 49, 0.3)',
    navButtonHover: 'rgba(255, 255, 255, 0.3)',
    navButtonActive: 'rgba(185, 24, 24, 0.3)'
  }
};

export function isLoggedInUser() {
  const username = localStorage.getItem('username');
  return typeof username === 'string' && username.trim() !== '';
}

export function resolveAppearanceScheme() {
  if (!isLoggedInUser()) {
    return 'Forest';
  }

  const saved = localStorage.getItem('curAppearanceScheme');
  return VALID_APPEARANCE_SCHEMES.includes(saved) ? saved : 'Forest';
}

export function getAppearanceGradient(scheme) {
  return APPEARANCE_GRADIENTS[scheme] || APPEARANCE_GRADIENTS.Forest;
}

export function getCurrentGradient() {
  return getAppearanceGradient(resolveAppearanceScheme());
}

export function applyCurrentGradient() {
  const scheme = resolveAppearanceScheme();
  const chrome = APPEARANCE_CHROME_COLORS[scheme] || APPEARANCE_CHROME_COLORS.Forest;
  const gradientBottom = APPEARANCE_GRADIENT_BOTTOM_COLORS[scheme] || APPEARANCE_GRADIENT_BOTTOM_COLORS.Forest;

  const gradientTopColors = {
    Forest: '#9DBF9E',
    Ocean: '#87b9d8',
    Sunset: '#ffd36b'
  };
  const gradientTopColor = gradientTopColors[scheme] || gradientTopColors.Forest;

  document.documentElement.style.setProperty('--page-gradient', getAppearanceGradient(scheme));
  document.documentElement.style.setProperty('--page-gradient-bottom', gradientBottom);
  document.documentElement.style.setProperty('--gradient-top-color', gradientTopColor);
  document.documentElement.style.setProperty('--nav-background', chrome.nav);
  document.documentElement.style.setProperty('--nav-background-disabled', chrome.navDisabled);
  document.documentElement.style.setProperty('--footer-background', chrome.footer);
  document.documentElement.style.setProperty('--nav-button-background', chrome.navButton);
  document.documentElement.style.setProperty('--nav-button-hover-background', chrome.navButtonHover);
  document.documentElement.style.setProperty('--nav-button-active-background', chrome.navButtonActive);
}
