(function () {
  'use strict';

  const config = window.NOS_SITE_CONFIG || {};
  const consentKey = 'nos-cookie-consent-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let choice = readChoice();

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(consentKey));
      if (saved && saved.version === 1 && typeof saved.analytics === 'boolean' && Number.isFinite(saved.savedAt) && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < lifetime) return saved;
    } catch (_) {}
    return null;
  }

  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.id = 'cookieBanner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-labelledby', 'cookieTitle');
  banner.hidden = Boolean(choice);
  banner.innerHTML = '<div class="cookie-copy"><h2 id="cookieTitle">Немного заботы о cookies.</h2><p>Мы сохраняем ваш выбор настроек. С вашего согласия Яндекс Метрика использует cookies, чтобы помогать нам улучшать сайт. <a href="privacy.html#cookies">Подробнее о cookies</a>.</p></div><div class="cookie-actions"><button type="button" id="acceptCookies">Разрешить аналитику</button><button class="cookie-decline" type="button" id="declineCookies">Только необходимые</button></div>';
  document.body.appendChild(banner);
  let settingsTrigger = null;

  function saveChoice(analytics, restoreFocus = true) {
    choice = { version: 1, analytics, savedAt: Date.now() };
    try { localStorage.setItem(consentKey, JSON.stringify(choice)); } catch (_) {}
    banner.hidden = true;
    if (restoreFocus) {
      if (settingsTrigger && settingsTrigger.isConnected) settingsTrigger.focus({ preventScroll: true });
      else if (banner.contains(document.activeElement)) document.querySelector('main, .legal-content')?.focus({ preventScroll: true });
    }
  }
  document.getElementById('acceptCookies').addEventListener('click', () => saveChoice(true));
  document.getElementById('declineCookies').addEventListener('click', () => saveChoice(false));
  document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    settingsTrigger = button;
    banner.hidden = false;
    document.getElementById(choice?.analytics ? 'acceptCookies' : 'declineCookies').focus({ preventScroll: true });
  }));
  window.addEventListener('storage', event => {
    if (event.key !== consentKey && event.key !== null) return;
    choice = readChoice();
    banner.hidden = Boolean(choice);
  });

  const operator = config.operator || {};
  document.querySelectorAll('[data-operator-name]').forEach(el => { if (operator.name) el.textContent = operator.name; });
  document.querySelectorAll('[data-operator-address]').forEach(el => { if (operator.address) { el.textContent = operator.address; el.closest('[data-operator-row]').hidden = false; } });
  document.querySelectorAll('[data-operator-email]').forEach(el => { if (operator.email) { el.textContent = operator.email; el.href = 'mailto:' + operator.email; el.closest('[data-operator-row]').hidden = false; } });
})();
