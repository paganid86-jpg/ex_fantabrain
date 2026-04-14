// ══════════════════════════════════════════════════════════
//  FantaBrain — Y2K Animation Utilities
//  Import and call these from React components via useEffect
// ══════════════════════════════════════════════════════════

/** Count up a number from 0 to target on a DOM element */
export function y2kCounter(el, target, duration = 1200) {
  const isFloat = target % 1 !== 0
  const start = performance.now()
  function tick(now) {
    const p = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3) // ease-out cubic
    const val = ease * target
    el.textContent = isFloat ? val.toFixed(1) : Math.round(val)
    if (p < 1) requestAnimationFrame(tick)
    else el.textContent = isFloat ? target.toFixed(1) : target
  }
  requestAnimationFrame(tick)
}

/** Render a segmented retro progress bar inside a container element */
export function y2kSegBar(container, value, max = 100, segments = 20) {
  container.innerHTML = ''
  container.style.cssText = 'display:flex;gap:2px;align-items:center;'
  const filled = Math.round((value / max) * segments)
  for (let i = 0; i < segments; i++) {
    const s = document.createElement('div')
    s.style.cssText = `width:100%;height:4px;background:${
      i < filled ? 'var(--y2k-blue)' : 'rgba(0,120,255,0.1)'
    };transition:background 0.05s;`
    container.appendChild(s)
    if (i < filled) {
      s.style.background = 'rgba(0,120,255,0.1)'
      setTimeout(() => { s.style.background = 'var(--y2k-blue)' }, i * 30)
    }
  }
}

/** Apply a quick glitch burst animation to an element */
export function y2kGlitch(el) {
  const frames = [
    { transform: 'skewX(-4deg)', filter: 'drop-shadow(3px 0 #0a84ff)' },
    { transform: 'skewX(4deg)',  filter: 'drop-shadow(-3px 0 #ff3b30)' },
    { transform: 'none',         filter: 'none' },
    { transform: 'skewX(-2deg)', filter: 'drop-shadow(2px 0 #0a84ff) brightness(1.3)' },
    { transform: 'none',         filter: 'none' },
  ]
  let i = 0
  const iv = setInterval(() => {
    Object.assign(el.style, frames[i % frames.length])
    i++
    if (i >= frames.length) { clearInterval(iv); Object.assign(el.style, frames[4]) }
  }, 60)
}

/** Apply 3D mouse-tracking tilt to all elements matching selector */
export function y2kInitTilt(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - 0.5) * 10
      const y = ((e.clientY - r.top)  / r.height - 0.5) * -10
      card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(4px)`
    })
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)'
    })
  })
}

/**
 * Run the page-load bar sequence.
 * @param {string} barSelector  - CSS selector for the bar container (#y2k-loadbar)
 * @param {string} labelSelector - CSS selector for the % label (#y2k-loadpct)
 * @param {Function} onComplete - callback when sequence ends
 */
export function y2kPageLoad(barSelector, labelSelector, onComplete) {
  const bar   = document.querySelector(barSelector)
  const label = document.querySelector(labelSelector)
  if (!bar) { if (onComplete) onComplete(); return }
  const total = 20
  bar.innerHTML = ''
  for (let i = 0; i < total; i++) {
    const s = document.createElement('div')
    s.className = 'y2k-lseg'
    bar.appendChild(s)
  }
  const segs = bar.querySelectorAll('.y2k-lseg')
  let i = 0
  const iv = setInterval(() => {
    if (i < total) {
      segs[i].classList.add('filled')
      i++
      if (label) label.textContent = Math.round((i / total) * 100) + '%'
    } else {
      clearInterval(iv)
      if (label) label.textContent = 'PRONTO'
      setTimeout(() => {
        const wrap = bar.closest('.y2k-loader')
        if (wrap) wrap.style.opacity = '0'
        if (onComplete) onComplete()
      }, 300)
    }
  }, 55)
}

/** Observe elements with data-counter attribute and count up when visible */
export function y2kObserveCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        const target = parseFloat(el.dataset.counter)
        if (!isNaN(target)) { y2kCounter(el, target); obs.unobserve(el) }
      }
    })
  }, { threshold: 0.3 })
  document.querySelectorAll('[data-counter]').forEach(el => obs.observe(el))
  return obs // return so caller can disconnect on cleanup
}

/** Add chrome shimmer element to all .y2k-card and .y2k-panel elements */
export function y2kInitShimmer() {
  document.querySelectorAll('.y2k-card, .y2k-panel, .y2k-stat-card').forEach(el => {
    if (el.querySelector('.y2k-shine')) return // avoid duplicates
    el.style.position = 'relative'
    el.style.overflow = 'hidden'
    const shine = document.createElement('div')
    shine.className = 'y2k-shine'
    el.appendChild(shine)
  })
}

/** Attach glitch-on-hover to elements with class y2k-glitch-hover */
export function y2kInitGlitchHover() {
  document.querySelectorAll('.y2k-glitch-hover').forEach(el => {
    el.addEventListener('mouseenter', () => y2kGlitch(el))
  })
}

/**
 * Full Y2K init — call from a top-level useEffect after mount.
 * Returns a cleanup function.
 */
export function y2kInit() {
  const obs = y2kObserveCounters()
  y2kInitTilt('.y2k-player-card')
  y2kInitShimmer()
  y2kInitGlitchHover()

  document.querySelectorAll('[data-segbar]').forEach(el => {
    y2kSegBar(el, parseFloat(el.dataset.segbar), parseFloat(el.dataset.segmax || 10))
  })

  return () => {
    if (obs) obs.disconnect()
  }
}
