// Copyright IBM Corp. 2026

/**
 * Load a script dynamically
 * @param url - The URL of the script to load
 * @returns Promise that resolves when script is loaded
 */
export async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };
    document.head.appendChild(script);
  });
}
