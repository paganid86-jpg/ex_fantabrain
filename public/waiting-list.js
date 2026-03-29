/* ── Typing Effect ─────────────────────────────────── */
(function () {
  const phrases = ['I dati ci sono sempre stati. Ora li capisci.', 'Schiera consapevolmente.', 'I numeri parlano. Fantabrain li traduce.','Non indovinare. Sapere.', 'Domina il Fantacalcio.'];
  const el = document.getElementById('typed');
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 65);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        setTimeout(tick, 420);
        return;
      }
      setTimeout(tick, 32);
    }
  }
  tick();
})();

/* ── Counter ────────────────────────────────────────── */
async function loadCount() {
  try {
    const res = await fetch('/api/waitlist/count');
    if (!res.ok) throw new Error();
    const { count } = await res.json();
    animateCount(count);
  } catch {
    document.getElementById('count-num').textContent = '0';
  }
}

function animateCount(target) {
  if (target === 0) { document.getElementById('count-num').textContent = '0'; return; }
  const el = document.getElementById('count-num');
  const duration = 1400;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('it-IT');
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── Scroll Reveal ──────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .features-grid, .steps-row').forEach(el => revealObs.observe(el));

/* ── Form Submit ─────────────────────────────────────── */
document.getElementById('waitlist-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('inp-name').value.trim();
  const email = document.getElementById('inp-email').value.trim();
  const lega = document.getElementById('inp-lega').value;
  const referral = document.getElementById('inp-referral').value.trim();
  const errEl = document.getElementById('form-error');

  errEl.style.display = 'none';

  if (!name) { showError('Inserisci il tuo nome.'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("Inserisci un'email valida."); return; }
  if (!lega) { showError('Seleziona che tipo di lega giochi.'); return; }

  setBtnLoading(true);

  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, lega, referral_code: referral || undefined }),
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('position-num').textContent = '#' + data.position;
      document.getElementById('referral-display').textContent = data.referral_code;
      setupShare(data.referral_code);
      document.getElementById('success-overlay').style.display = 'flex';
      loadCount();
    } else {
      showError(data.error || 'Qualcosa è andato storto. Riprova.');
    }
  } catch {
    showError('Errore di rete. Controlla la connessione e riprova.');
  } finally {
    setBtnLoading(false);
  }
});

function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function setBtnLoading(loading) {
  const btn = document.getElementById('cta-btn');
  const label = document.getElementById('btn-label');
  const arrow = document.getElementById('btn-arrow');
  btn.disabled = loading;
  if (loading) {
    label.textContent = 'Iscrizione in corso...';
    arrow.innerHTML = '<span class="spinner"></span>';
  } else {
    label.textContent = "Voglio l'accesso beta";
    arrow.textContent = '→';
  }
}

/* ── Share ───────────────────────────────────────────── */
function setupShare(code) {
  const url = `${window.location.origin}/waiting-list?ref=${code}`;

  document.getElementById('share-wa').onclick = () => {
    const text = `🤖 Ho scoperto FantaBrain — la prima AI italiana per il Fantacalcio! Entra in lista con il mio codice ${code} e scala la coda:\n${url}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  document.getElementById('share-copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      document.getElementById('copy-label').textContent = 'Copiato!';
      document.getElementById('copy-icon').textContent = '✓';
      setTimeout(() => {
        document.getElementById('copy-label').textContent = 'Copia link';
        document.getElementById('copy-icon').textContent = '📋';
      }, 2000);
    } catch {
      document.getElementById('copy-label').textContent = url;
    }
  };
}

/* ── Overlay close ────────────────────────────────────── */
document.getElementById('success-close').onclick = () => {
  document.getElementById('success-overlay').style.display = 'none';
};

document.getElementById('success-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('success-overlay')) {
    document.getElementById('success-overlay').style.display = 'none';
  }
});

/* ── Final CTA button ─────────────────────────────────── */
document.getElementById('final-cta-btn').onclick = () => {
  document.getElementById('inp-name').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ── Referral code in URL ─────────────────────────────── */
(function () {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) document.getElementById('inp-referral').value = ref;
})();

/* ── Init ─────────────────────────────────────────────── */
loadCount();
