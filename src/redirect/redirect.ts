// Copyright IBM Corp. 2026

/* global Office, window */

// Allowlist of permitted domains for redirect
const allowedDomains = ["*.ibm.com", "ibm.com"];

// Only allow HTTPS protocol for security
const allowedProtocols = ["https:"];

Office.onReady(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const targetUrl = urlParams.get("url");

  if (isValidUrl(targetUrl) && targetUrl) {
    try {
      window.location.href = targetUrl;
    } catch (error) {
      console.error("Error redirecting:", error);
      document.body.innerHTML = '<div class="error-message">Error: Unable to redirect</div>';
    }
  } else if (targetUrl) {
    // URL provided but not valid/allowed
    document.body.innerHTML = '<div class="error-message">Error: Invalid or unauthorized URL</div>';
  } else {
    // No URL provided
    document.body.innerHTML = '<div class="error-message">Error: No URL specified</div>';
  }
});

export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Check if protocol is allowed (prevents javascript:, data:, file: URIs)
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      console.warn(`Blocked redirect: Invalid protocol "${parsedUrl.protocol}"`);
      return false;
    }

    // Check if domain is in allowlist (prevents open redirect attacks)
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );

    if (!isAllowed) {
      console.warn(`Blocked redirect: Unauthorized domain "${hostname}"`);
    }

    return isAllowed;
  } catch (error) {
    console.error("Invalid URL format:", error);
    return false;
  }
}
