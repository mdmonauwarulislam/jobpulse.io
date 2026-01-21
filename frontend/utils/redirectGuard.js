/**
 * Redirect guard to prevent infinite redirect loops
 * Tracks recent redirects and prevents redirecting to the same path multiple times
 */

let redirectHistory = [];
let lastRedirectTime = 0;
const REDIRECT_COOLDOWN = 100; // milliseconds
const MAX_HISTORY = 10;

export function canRedirect(fromPath, toPath) {
  const now = Date.now();
  
  // Clear old history if too much time has passed
  if (now - lastRedirectTime > 2000) {
    redirectHistory = [];
  }
  
  // Prevent redirects that are too frequent
  if (now - lastRedirectTime < REDIRECT_COOLDOWN) {
    console.warn('[RedirectGuard] Redirect prevented - too frequent:', { fromPath, toPath, timeSinceLast: now - lastRedirectTime });
    return false;
  }
  
  // Prevent redirect loops (A -> B -> A)
  if (redirectHistory.length >= 2) {
    const last = redirectHistory[redirectHistory.length - 1];
    const secondLast = redirectHistory[redirectHistory.length - 2];
    
    if (secondLast.from === toPath && last.from === fromPath && last.to === toPath) {
      console.error('[RedirectGuard] Redirect loop detected:', { fromPath, toPath, history: redirectHistory });
      return false;
    }
  }
  
  // Prevent redirecting to the same path
  if (fromPath === toPath) {
    return false;
  }
  
  // Record this redirect
  redirectHistory.push({ from: fromPath, to: toPath, time: now });
  if (redirectHistory.length > MAX_HISTORY) {
    redirectHistory.shift();
  }
  lastRedirectTime = now;
  
  return true;
}

export function clearRedirectHistory() {
  redirectHistory = [];
  lastRedirectTime = 0;
}
