/* cart-free-shipping-milestones.js - hamtaro.sa cart milestones | v1.1.0 */
(function () {
  'use strict';

  var CART_PATHS = ['/cart', '/ar/cart', '/en/cart'];
  var THRESHOLD_SHIPPING = 299;
  var THRESHOLD_GIFT = 399;
  var CURRENCY = 'ر.س';
  var COLOR = '#059b54';
  var RECS_URL = 'https://hamtaro.sa/ar/category/DYEAZy?filters%5Bcategory_id%5D=484303284&sort=topRated';

  if (!isCartPage()) return;

  injectStyles();

  function isCartPage() {
    var path = window.location.pathname;
    return CART_PATHS.some(function (cartPath) {
      return path === cartPath || path.indexOf(cartPath + '/') === 0;
    });
  }

  function injectStyles() {
    if (document.getElementById('cfm-style')) return;

    var style = document.createElement('style');
    style.id = 'cfm-style';
    style.textContent = `
      #cfm-wrap {
        padding: 14px 16px 12px;
        margin: 8px 0;
        direction: rtl;
        border: 1px solid #c9e2d6;
        border-radius: 12px;
        background: #f0faf4;
        font-family: Cairo, Tajawal, Almarai, sans-serif;
      }

      .cfm-phase { padding: 10px 0 6px; }

      .cfm-phase-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
      }

      .cfm-phase-icon {
        flex-shrink: 0;
        font-size: 1rem;
        line-height: 1;
      }

      .cfm-phase-label {
        flex: 1;
        color: #14532d;
        font-size: .82rem;
        font-weight: 800;
      }

      .cfm-phase-note {
        padding: 2px 8px;
        border-radius: 20px;
        background: #e5e7eb;
        color: #4b5563;
        font-size: .66rem;
        font-weight: 700;
        white-space: nowrap;
      }

      .cfm-track-wrap { margin-bottom: 5px; padding: 0 4px; }

      .cfm-track {
        position: relative;
        height: 7px;
        overflow: hidden;
        border-radius: 20px;
        background: #cce8d8;
      }

      .cfm-fill {
        position: absolute;
        top: 0;
        right: 0;
        max-width: 100%;
        height: 100%;
        border-radius: 20px;
        background: linear-gradient(270deg, #4ade80, ${COLOR});
        transition: width .6s cubic-bezier(.22, 1, .36, 1);
      }

      @media (prefers-reduced-motion: reduce) {
        .cfm-fill { transition: none; }
      }

      .cfm-phase-status {
        min-height: 16px;
        color: #4a6558;
        font-size: .75rem;
        font-weight: 600;
        line-height: 1.35;
      }

      .cfm-phase-status.cfm-status-done {
        color: ${COLOR};
        font-weight: 800;
      }

      #cfm-recs-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 12px;
        direction: rtl;
      }

      #cfm-recs-row.hidden { display: none; }

      #cfm-recs-hint {
        flex: 1;
        color: #4a6558;
        font-size: .72rem;
        font-weight: 600;
        line-height: 1.35;
      }

      #cfm-recs-btn {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        gap: 5px;
        padding: 6px 14px;
        border-radius: 20px;
        background: ${COLOR};
        color: #fff;
        font-family: inherit;
        font-size: .74rem;
        font-weight: 700;
        text-decoration: none;
        transition: opacity .2s;
      }

      #cfm-recs-btn:hover { opacity: .85; }
      #cfm-recs-btn:active { transform: scale(.98); }

      @media (max-width: 480px) {
        #cfm-wrap { padding: 12px; }
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  // Free-shipping phase (299) is frozen — approved plan for this round only
  // activates the gift phase (399). Do not reintroduce phase1 logic without
  // an explicit go-ahead; THRESHOLD_SHIPPING is kept only for that future switch.
  function updateWidget(total) {
    var phase1 = document.getElementById('cfm-phase1');
    var phase2 = document.getElementById('cfm-phase2');
    var p2Fill = document.getElementById('cfm-p2-fill');
    var p2Status = document.getElementById('cfm-p2-status');
    var p2Icon = document.getElementById('cfm-p2-icon');
    var recsRow = document.getElementById('cfm-recs-row');
    var recsHint = document.getElementById('cfm-recs-hint');

    if (!phase2) return;

    var giftDone = total >= THRESHOLD_GIFT;

    if (phase1) phase1.style.display = 'none';
    phase2.style.display = '';

    if (p2Fill) p2Fill.style.width = Math.min(100, (total / THRESHOLD_GIFT) * 100).toFixed(2) + '%';

    if (giftDone) {
      if (p2Icon) p2Icon.textContent = '✅';
      if (p2Status) {
        p2Status.className = 'cfm-phase-status cfm-status-done';
        p2Status.textContent = '🎉 هديتك جاهزة وستُضاف لطلبك تلقائياً!';
      }
    } else {
      var giftRemaining = (THRESHOLD_GIFT - total).toFixed(2);
      if (p2Icon) p2Icon.textContent = '🎁';
      if (p2Status) {
        p2Status.className = 'cfm-phase-status';
        p2Status.innerHTML = 'باقي <strong>' + giftRemaining + ' ' + CURRENCY + '</strong> للهدية المجانية';
      }
    }

    if (recsRow) recsRow.classList.toggle('hidden', giftDone);
    if (recsHint) {
      recsHint.textContent = 'باقي ' + (THRESHOLD_GIFT - total).toFixed(2) + ' ' + CURRENCY + ' للهدية! تسوّق الأكثر مبيعاً 🎁';
    }
  }

  function extractTotal(response) {
    var data = (response && response.data) || response || {};
    var cart = data.cart || data;
    // Prefer the tax-inclusive amount the customer actually sees; sub_total
    // (pre-tax) understated progress toward the threshold.
    var rawTotal = cart.total || cart.total_amount || cart.sub_total || 0;
    var total = typeof rawTotal === 'number'
      ? rawTotal
      : parseFloat(String(rawTotal).replace(/[^0-9.]/g, ''));

    return isNaN(total) ? 0 : total;
  }

  function refresh() {
    var sdk = window.salla || window.Salla;
    if (!sdk || !sdk.cart) return;

    try {
      var request = typeof sdk.cart.details === 'function'
        ? sdk.cart.details()
        : typeof sdk.cart.latest === 'function'
          ? sdk.cart.latest()
          : null;

      if (request && typeof request.then === 'function') {
        request.then(function (response) {
          updateWidget(extractTotal(response));
        }).catch(function () {});
      }
    } catch (error) {}
  }

  function buildWidget() {
    var widget = document.createElement('div');
    widget.id = 'cfm-wrap';
    widget.innerHTML =
      '<div id="cfm-phase1" class="cfm-phase">' +
        '<div class="cfm-phase-header">' +
          '<span class="cfm-phase-icon" id="cfm-p1-icon">🚚</span>' +
          '<span class="cfm-phase-label">شحن مجاني</span>' +
          '<span class="cfm-phase-note">لعملاء الرياض فقط</span>' +
        '</div>' +
        '<div class="cfm-track-wrap"><div class="cfm-track">' +
          '<div class="cfm-fill" id="cfm-p1-fill" style="width:0%"></div>' +
        '</div></div>' +
        '<div class="cfm-phase-status" id="cfm-p1-status"></div>' +
      '</div>' +
      '<div id="cfm-phase2" class="cfm-phase" style="display:none">' +
        '<div class="cfm-phase-header">' +
          '<span class="cfm-phase-icon" id="cfm-p2-icon">🎁</span>' +
          '<span class="cfm-phase-label">هدية مجانية</span>' +
        '</div>' +
        '<div class="cfm-track-wrap"><div class="cfm-track">' +
          '<div class="cfm-fill" id="cfm-p2-fill" style="width:0%"></div>' +
        '</div></div>' +
        '<div class="cfm-phase-status" id="cfm-p2-status"></div>' +
      '</div>' +
      '<div id="cfm-recs-row">' +
        '<a id="cfm-recs-btn" href="' + RECS_URL + '" target="_blank" rel="noopener">' +
          '<i class="sicon-fire"></i> تسوّق الآن!' +
        '</a>' +
        '<span id="cfm-recs-hint"></span>' +
      '</div>';

    return widget;
  }

  function injectWidget(target) {
    if (document.getElementById('cfm-wrap')) return;
    target.parentNode.replaceChild(buildWidget(), target);
    refresh();
  }

  function watchForTarget() {
    var existing = document.querySelector('salla-conditional-offer');
    if (existing) {
      injectWidget(existing);
      return;
    }

    var observer = new MutationObserver(function (mutations, activeObserver) {
      var target = document.querySelector('salla-conditional-offer');
      if (!target) return;
      activeObserver.disconnect();
      injectWidget(target);
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function boot() {
    watchForTarget();
    refresh();

    document.addEventListener('change', function (event) {
      var target = event.target;
      var form = target && target.closest ? target.closest('[onchange*="cart.updateItem"]') : null;
      if (form) setTimeout(refresh, 600);
    });

    var sdk = window.salla || window.Salla;
    if (sdk && sdk.cart) {
      try {
        if (sdk.cart.event && typeof sdk.cart.event.onUpdated === 'function') {
          sdk.cart.event.onUpdated(function (response) {
            updateWidget(extractTotal(response));
          });
        }
        if (sdk.cart.event && typeof sdk.cart.event.onAdded === 'function') {
          sdk.cart.event.onAdded(function () {
            setTimeout(refresh, 500);
          });
        }
      } catch (error) {}
    }

    if ('MutationObserver' in window && document.body) {
      new MutationObserver(function (mutations) {
        for (var index = 0; index < mutations.length; index += 1) {
          if (mutations[index].removedNodes.length) {
            setTimeout(refresh, 400);
            return;
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
