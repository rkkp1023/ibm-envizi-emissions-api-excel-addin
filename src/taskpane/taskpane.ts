/*
 * Copyright IBM Corp. 2025
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import { Theme, webDarkTheme, webLightTheme } from "@fluentui/tokens";

import {
  accordionDefinition,
  accordionItemDefinition,
  ButtonDefinition,
  CheckboxDefinition,
  FieldDefinition,
  FluentDesignSystem,
  LinkDefinition,
  setTheme,
  TabDefinition,
  TablistDefinition,
  TextInputDefinition,
} from "@fluentui/web-components";

import {
  ApiCredentials,
  loadApiCredentialsFromStorage,
  removeApiCredentialsFromStorage,
  saveApiCredentialsToStorage,
  setApiCredentials,
} from "../common/credentials";
import { getEnvType } from "../common/env";
import { ensureClient, resetClient } from "../functions/client";

accordionDefinition.define(FluentDesignSystem.registry);
accordionItemDefinition.define(FluentDesignSystem.registry);
LinkDefinition.define(FluentDesignSystem.registry);
ButtonDefinition.define(FluentDesignSystem.registry);
CheckboxDefinition.define(FluentDesignSystem.registry);
TabDefinition.define(FluentDesignSystem.registry);
TablistDefinition.define(FluentDesignSystem.registry);
TextInputDefinition.define(FluentDesignSystem.registry);
FieldDefinition.define(FluentDesignSystem.registry);

/* global console, document, Excel, Office */

const apiHomeUrls = {
  prod: "https://www.app.ibm.com/envizi/emissions-api-home",
  np: "https://www-dev.app.ibm.com/envizi/emissions-api-home",
  local: "https://www-dev.app.ibm.com/envizi/emissions-api-home",
};

let getStartedClicked = false;
let pageElements: HTMLElement[];

initTheme();

// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "block";

  pageElements = Array.from(document.getElementsByClassName("page")) as HTMLElement[];
  getStartedClicked = window.localStorage.getItem("getStartedClicked") === "true";

  initGetStartedPage();
  initLoginPage();
  initMainPage();

  loadApiCredentialsFromStorage().then((apiCredentials) => {
    if (apiCredentials) {
      const credentialsForm = document.forms["credentials"];
      credentialsForm["apiKey"].value = apiCredentials.apiKey;
      credentialsForm["tenantId"].value = apiCredentials.tenantId;
      credentialsForm["orgId"].value = apiCredentials.orgId;
    }

    let pageId = "welcome-page";
    if (apiCredentials) {
      pageId = "main-page";
    } else if (getStartedClicked) {
      pageId = "login-page";
    }
    switchPage(pageId);
  });
});

function getOverviewDashboardUrl(): string {
  return `${apiHomeUrls[getEnvType()]}/overview`;
}

function initGetStartedPage(): void {
  document.getElementById("get-started-button").onclick = () => {
    getStartedClicked = true;
    window.localStorage.setItem("getStartedClicked", "true");
    switchPage("login-page");
  };
}

function initLoginPage(): void {
  (document.getElementById("overview-dashboard-link") as any).href = getOverviewDashboardUrl();
  const loginForm = document.forms["login"];
  loginForm.onsubmit = (event: Event) => {
    event.preventDefault();
    login();
  };
}

function initMainPage(): void {
  document.getElementById("view-dashboard-button").onclick = () => {
    window.open(getOverviewDashboardUrl(), "_blank", "noopener");
  };
  document.getElementById("logout-button").onclick = logout;
}

function switchPage(id: string): void {
  pageElements.forEach((pageElement) => {
    pageElement.hidden = pageElement.id !== id;
  });
}

export function login(): void {
  const loginForm = document.forms["login"];
  const apiCredentials: ApiCredentials = {
    apiKey: loginForm["apiKey"].value,
    tenantId: loginForm["tenantId"].value,
    orgId: loginForm["orgId"].value,
  };

  const errorMessageElement = document.getElementById("login-error-message");
  errorMessageElement.innerText = "";
  errorMessageElement.hidden = true;

  ensureClient(apiCredentials)
    .then(() => {
      if (loginForm["saveCredentials"].value) {
        saveApiCredentialsToStorage(apiCredentials);
      } else {
        setApiCredentials(apiCredentials);
        removeApiCredentialsFromStorage();
      }
      const credentialsForm = document.forms["credentials"];
      credentialsForm["apiKey"].value = apiCredentials.apiKey;
      credentialsForm["tenantId"].value = apiCredentials.tenantId;
      credentialsForm["orgId"].value = apiCredentials.orgId;

      switchPage("main-page");
    })
    .catch((e) => {
      const errorMessage =
        e.status === 401
          ? "Invalid credentials. Please enter your credentials and try again."
          : "Something went wrong. Please try again later.";
      errorMessageElement.innerText = errorMessage;
      errorMessageElement.hidden = false;
    });
}

export function logout(): void {
  setApiCredentials(null);
  removeApiCredentialsFromStorage();
  resetClient();

  const loginForm = document.forms["login"];
  loginForm["apiKey"].value = "";
  loginForm["tenantId"].value = "";
  loginForm["orgId"].value = "";
  switchPage("login-page");
}

function initTheme(): void {
  setTheme(getCurrentTheme(), document.body);
}

function getCurrentTheme(): Theme {
  let theme = webLightTheme;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  const officeDark = Office.context?.officeTheme?.isDarkTheme ?? false;
  const isOnline = Office.context?.diagnostics?.platform === Office.PlatformType.OfficeOnline;

  if (!isOnline) {
    // Determine dark mode based on Office theme and system preference
    theme = (officeDark && prefersDark) || prefersDark ? webDarkTheme : webLightTheme;
    listenToSystemThemeChanges();
  }

  return theme;
}

function listenToSystemThemeChanges(): void {
  const darkModeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!darkModeQuery) return;

  darkModeQuery.addEventListener("change", (e) => {
    setTheme(e.matches ? webDarkTheme : webLightTheme);
  });
}
