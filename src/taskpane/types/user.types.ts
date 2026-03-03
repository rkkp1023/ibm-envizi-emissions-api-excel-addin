/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  orgName: string;
  orgId: string;
  languageCode?: string;
  timeZoneId?: string;
}

export interface UserInfoResponse {
  data: {
    me: {
      tenantId: number;
      languageCode: string;
      timeZoneId: string;
      contact: {
        emailAddress: string;
        lastName: string;
        firstName: string;
      };
    };
    user: {
      associateName: string;
      rolesMeta: string;
    };
  };
}
