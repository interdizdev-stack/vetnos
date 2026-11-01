(function () {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hosts = [...document.querySelectorAll('.doctor-card,.gallery-expand-item,.approach-photo,.booking-invitation')];
  const activePulses = new Set();

  document.querySelectorAll('.motion-title').forEach(heading => {
    heading.querySelectorAll('.motion-line').forEach((line, index) => line.style.setProperty('--line-delay', index * 110 + 'ms'));
  });
  hosts.forEach(host => {
    host.querySelectorAll('.doctor-portrait,.gallery-media,.approach-photo > img').forEach(photo => photo.classList.add('photo-reveal'));
    const details = host.querySelectorAll('.doctor-info h3,.doctor-specialty,.gallery-caption > .specialist-name,.gallery-caption > span:not(.specialist-name):not(.specialist-pet-note),.specialist-pet-note,.doctor-home');
    details.forEach((detail, index) => {
      detail.classList.add('detail-reveal');
      detail.style.setProperty('--detail-delay', 140 + index * 80 + 'ms');
    });
    host.querySelectorAll('.doctor-heart path,.specialist-pet-heart path').forEach(heart => {
      heart.setAttribute('pathLength', '1');
      heart.classList.add('drawn-heart');
    });
    host.addEventListener('focusin', () => host.classList.add('has-arrived'));
  });
  document.querySelectorAll('.booking-dialog .form-field').forEach((field, index) => field.style.setProperty('--field-order', index));
  document.querySelectorAll('.menu-links a').forEach((link, index) => link.style.setProperty('--menu-order', index));

  document.querySelectorAll('.nav-links a,.nav-book').forEach(link => {
    const nodes = [...link.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (!nodes.length) return;
    const label = nodes.map(node => node.textContent.trim()).join(' ');
    const labelWindow = document.createElement('span');
    labelWindow.className = 'nav-label-window';
    const main = document.createElement('span');
    main.className = 'nav-label-main'; main.textContent = label;
    const next = document.createElement('span');
    next.className = 'nav-label-next'; next.textContent = label; next.setAttribute('aria-hidden', 'true');
    labelWindow.append(main, next); nodes[0].replaceWith(labelWindow);
    nodes.slice(1).forEach(node => node.remove());
    link.classList.add('nav-animated');
  });

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('has-arrived');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    hosts.forEach(host => observer.observe(host));
    if (!reduced.matches) root.classList.add('motion-enhanced');
  } else hosts.forEach(host => host.classList.add('has-arrived'));

  document.querySelectorAll('.primary-button').forEach(button => {
    let frame = 0;
    let nextX = 0, nextY = 0;
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0;
      button.style.removeProperty('--pointer-x');
      button.style.removeProperty('--pointer-y');
    };
    button.addEventListener('pointermove', event => {
      if (reduced.matches || !pointer.matches || event.pointerType === 'touch' || button.closest('dialog')) return;
      const rect = button.getBoundingClientRect();
      nextX = Math.max(-4, Math.min(4, ((event.clientX - rect.left) / rect.width - 0.5) * 8));
      nextY = Math.max(-3, Math.min(3, ((event.clientY - rect.top) / rect.height - 0.5) * 6));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        button.style.setProperty('--pointer-x', nextX.toFixed(2) + 'px');
        button.style.setProperty('--pointer-y', nextY.toFixed(2) + 'px');
      });
    }, { passive: true });
    button.addEventListener('pointerleave', reset);
    button.addEventListener('blur', reset);
    button.addEventListener('click', event => {
      if (reduced.matches || button.disabled) return;
      const rect = button.getBoundingClientRect();
      const pulse = document.createElement('span');
      pulse.className = 'button-pulse';
      pulse.setAttribute('aria-hidden', 'true');
      pulse.style.setProperty('--pulse-x', (event.detail ? event.clientX - rect.left : rect.width / 2) + 'px');
      pulse.style.setProperty('--pulse-y', (event.detail ? event.clientY - rect.top : rect.height / 2) + 'px');
      button.appendChild(pulse); activePulses.add(pulse);
      const remove = () => { pulse.remove(); activePulses.delete(pulse); };
      pulse.addEventListener('animationend', remove, { once: true });
      setTimeout(remove, 900);
    });
    reduced.addEventListener('change', reset);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      root.classList.remove('motion-enhanced');
      hosts.forEach(host => host.classList.add('has-arrived'));
      activePulses.forEach(pulse => pulse.remove()); activePulses.clear();
    } else if (observer) root.classList.add('motion-enhanced');
  });
})();
