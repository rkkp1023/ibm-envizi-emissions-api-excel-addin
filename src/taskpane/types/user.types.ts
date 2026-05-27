// Copyright IBM Corp. 2026

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  orgName: string;
  effectiveTo: string;
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
    currentAssociate: {
      id: string;
      name: string;
      effectiveTo: string;
    };
  };
}
