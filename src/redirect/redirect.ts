// Copyright IBM Corp. 2026

/* global window */

// Allowlist of permitted domains for redirect
const allowedDomains = ["*.ibm.com", "ibm.com"];

// Only allow HTTPS protocol for security
const allowedProtocols = ["https:"];

const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get("url");

const validUrl = targetUrl ? validateUrl(targetUrl) : null;

if (validUrl) {
  window.location.href = validUrl;
}

export function validateUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    // Check if protocol is allowed (prevents javascript:, data:, file: URIs)
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      console.warn(`Blocked redirect: Invalid protocol "${parsedUrl.protocol}"`);
      return null;
    }

    // Check if domain is in allowlist (prevents open redirect attacks)
    const hostname = parsedUrl.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );

    if (!isAllowed) {
      console.warn(`Blocked redirect: Unauthorized domain "${hostname}"`);
      return null;
    }

    return parsedUrl.href;
  } catch (error) {
    console.error("Invalid URL format:", error);
    return null;
  }
}
