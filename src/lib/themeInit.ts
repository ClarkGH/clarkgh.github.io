// The pre-paint theme script: applies a saved light/dark choice before first paint, so there's no flash.
// It has to run inline, and Astro doesn't hash inline scripts for the CSP, so this one string is both
// rendered by Base.astro and hashed by astro.config.mjs. Change it here and both follow. See docs/security.md.
export const THEME_INIT =
  "try{const t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}";
