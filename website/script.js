//This is the Javascript that handles the slideshow on the home page.

let slideIndex = 0;
let slideInterval;
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}

function nextSlide() {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}

function prevSlide() {
  slideIndex = (slideIndex - 1 + slides.length) % slides.length;
  showSlide(slideIndex);
}

function resetTimer() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 6000);
}

if (nextBtn && prevBtn && slides.length > 0) {
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetTimer();
  });
  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetTimer();
  });
  resetTimer();
  showSlide(slideIndex);
}
















// Responsive nav overflow handler.
// Ensure overflowed ("missing") items appear in the visible dropdown when opened.
// The visible dropdown is the nav-overflow-list (storage). On open we rebalance
// then unhide the storage list and attach click handlers to its items.

(function () {
  const header = document.getElementById('site-header');
  const nav = document.getElementById('main-nav');
  const navPrimary = document.getElementById('nav-primary');
  const overflowList = document.getElementById('nav-overflow-list'); // storage for moved items (visible menu)
  const overflowMenu = document.getElementById('nav-overflow-menu'); // kept but unused/hidden
  const overflowPanel = document.getElementById('nav-overflow');
  const toggle = document.getElementById('nav-toggle');

  if (!header || !nav || !navPrimary || !overflowList || !overflowMenu || !toggle || !overflowPanel) return;

  // Track whether the user explicitly opened the menu
  let userToggledOpen = false;
  // Suppress observers for a short time after user toggles to avoid flicker
  let suppressObserverUntil = 0;
  const SUPPRESS_MS_AFTER_USER_TOGGLE = 300;

  // Move last visible item into overflow storage (preserve DOM order: overflow acts like extension)
  function moveLastToOverflow() {
    const items = navPrimary.children;
    if (!items || items.length === 0) return false;
    const last = items[items.length - 1];
    // move it to the START of overflow list to preserve reading order when opened
    overflowList.insertBefore(last, overflowList.firstChild);
    return true;
  }

  // Move first overflow item back into primary end (restore order)
  function moveFirstBack() {
    const items = overflowList.children;
    if (!items || items.length === 0) return false;
    const first = items[0];
    navPrimary.appendChild(first);
    return true;
  }

  // Show/hide the overflow toggle button based on whether there are overflow items
  function updateToggleVisibility() {
    const hasOverflow = overflowList.children.length > 0;
    if (hasOverflow) {
      toggle.hidden = false;
    } else {
      // No overflow items: hide the toggle and ensure overflow panel is closed
      toggle.hidden = true;
      overflowPanel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      overflowPanel.setAttribute('aria-hidden', 'true');
      userToggledOpen = false;
      // keep storage hidden; visual hiding is controlled in open/close
      overflowMenu.hidden = true;
      overflowList.hidden = true;
    }
  }

  // Core: ensure navPrimary does not overflow; move items into overflow as needed
  function balanceNavItems() {
    // If user just toggled, briefly ignore to avoid flicker
    if (Date.now() < suppressObserverUntil) return;

    // First, move items out while there's an overflow
    // Use a safety counter to avoid infinite loops
    let safety = 50;
    while (navPrimary.scrollWidth > navPrimary.clientWidth + 1 && safety-- > 0) {
      // move last item to overflow (storage)
      const moved = moveLastToOverflow();
      if (!moved) break;
    }

    // Then, try to move items back while there's room
    safety = 50;
    while (overflowList.children.length > 0 && safety-- > 0) {
      // Measure the first overflow item by temporarily appending it and checking width
      const firstOverflow = overflowList.children[0];
      if (!firstOverflow) break;

      // Append it temporarily to measure its width with current styles
      navPrimary.appendChild(firstOverflow);
      // If this made the primary overflow, move it back
      if (navPrimary.scrollWidth > navPrimary.clientWidth + 1) {
        // move it back to overflow (put at front to preserve order)
        overflowList.insertBefore(navPrimary.children[navPrimary.children.length - 1], overflowList.firstChild);
        break; // no more room
      } else {
        // It fit — leave it in navPrimary and continue
        // continue loop to see if more overflow items can fit
      }
    }

    updateToggleVisibility();
  }

  // Debounce helper
  function debounce(fn, wait = 50) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const debouncedBalance = debounce(balanceNavItems, 60);

  // Ensure storage items are menu-friendly and attach click handlers that close the menu.
  // We replace each stored child with a fresh clone to avoid accumulating handlers.
  function makeStorageMenuFriendly() {
    Array.from(overflowList.children).forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute('role', 'menuitem');
      if (clone.tagName && clone.tagName.toLowerCase() === 'a') {
        clone.setAttribute('tabindex', '0');
        // close the menu when an overflowed link is activated
        clone.addEventListener('click', () => {
          closeOverflowMenu();
        });
      } else {
        // non-anchor items: make them keyboard accessible
        clone.setAttribute('tabindex', '0');
      }
      overflowList.replaceChild(clone, el);
    });
  }

  function openOverflowMenu() {
    // Before opening, force a synchronous re-balance so overflowList actually contains the missing items.
    balanceNavItems();

    // If there are no overflowed items after balancing, do nothing (toggle should be hidden)
    if (overflowList.children.length === 0) {
      return;
    }

    // Show the storage list (this is the visible menu)
    overflowList.hidden = false;
    // Keep the cloned-menu hidden (we don't use it)
    overflowMenu.hidden = true;

    // Move the panel to the document body so it's not clipped by header overflow
    if (!document.body.contains(overflowPanel)) {
      document.body.appendChild(overflowPanel);
    }

    // Prepare items and show panel
    makeStorageMenuFriendly();
    overflowPanel.classList.add('open');
    overflowPanel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');

    // Focus first overflowed link if present
    const firstLink = overflowList.querySelector('.nav-link, a, [tabindex="0"]');
    if (firstLink) firstLink.focus();
  }

  function closeOverflowMenu() {
    // Hide the visible storage list
    overflowList.hidden = true;
    // Reset panel ARIA/state
    overflowPanel.classList.remove('open');
    overflowPanel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');

    // Move panel back into nav to preserve original DOM location (optional)
    if (!nav.contains(overflowPanel)) {
      nav.appendChild(overflowPanel);
    }

    toggle.focus();
    userToggledOpen = false;
  }

  // Toggle handler: open/close overflow panel
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    const willOpen = !expanded;

    userToggledOpen = willOpen;
    // Suppress observers so resize/measurement won't immediately close it
    suppressObserverUntil = Date.now() + SUPPRESS_MS_AFTER_USER_TOGGLE;

    toggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      openOverflowMenu();
    } else {
      closeOverflowMenu();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!overflowPanel.classList.contains('open')) return;
    if (header.contains(e.target)) return;
    closeOverflowMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overflowPanel.classList.contains('open')) {
      closeOverflowMenu();
    }
  });

  // Observe size changes to rebalance
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(debouncedBalance);
    ro.observe(header);
    ro.observe(navPrimary);
    ro.observe(document.documentElement);
  } else {
    window.addEventListener('resize', debouncedBalance);
  }

  // Observe DOM changes in the primary nav to rebalance (e.g., dynamic items)
  if (window.MutationObserver) {
    const mo = new MutationObserver(debouncedBalance);
    mo.observe(navPrimary, { childList: true, subtree: false, characterData: false });
  }

  // Initial setup
  window.requestAnimationFrame(() => {
    // Initially hide storage; it will be shown when there are moved items.
    overflowList.hidden = true;
    balanceNavItems();
    // Ensure panel is collapsed initially and ARIA kept in sync
    overflowPanel.classList.remove('open');
    overflowPanel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  });

  // Expose for debugging
  window.__navOverflow = {
    balance: balanceNavItems,
    _getOverflowCount: () => overflowList.children.length,
    _openMenu: openOverflowMenu,
    _closeMenu: closeOverflowMenu
  };
})();

