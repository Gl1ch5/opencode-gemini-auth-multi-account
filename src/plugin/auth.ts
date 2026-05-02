import type { AccountDetails, AuthDetails, OAuthAuthDetails, RefreshParts } from "./types";

const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60 * 1000;

export function isOAuthAuth(auth: AuthDetails): auth is OAuthAuthDetails {
  return auth?.type === "oauth";
}

/**
 * Splits a packed refresh string into its constituent refresh token and project IDs.
 */
export function parseRefreshParts(refresh: string): RefreshParts {
  const [refreshToken = "", projectId = "", managedProjectId = ""] = (refresh ?? "").split("|");
  return {
    refreshToken,
    projectId: projectId || undefined,
    managedProjectId: managedProjectId || undefined,
  };
}

/**
 * Serializes refresh token parts into the stored string format.
 */
export function formatRefreshParts(parts: RefreshParts): string {
  if (!parts.refreshToken) {
    return "";
  }

  if (!parts.projectId && !parts.managedProjectId) {
    return parts.refreshToken;
  }

  const projectSegment = parts.projectId ?? "";
  const managedSegment = parts.managedProjectId ?? "";
  return `${parts.refreshToken}|${projectSegment}|${managedSegment}`;
}

/**
 * Determines whether an access token is expired or missing, with buffer for clock skew.
 */
export function accessTokenExpired(auth: { access?: string; expires?: number }): boolean {
  if (!auth.access || typeof auth.expires !== "number") {
    return true;
  }
  return auth.expires <= Date.now() + ACCESS_TOKEN_EXPIRY_BUFFER_MS;
}

/**
 * Merges a new account into the auth details, updating the active account fields.
 */
export function upsertAccount(
  auth: OAuthAuthDetails | undefined,
  newAccount: AccountDetails,
): OAuthAuthDetails {
  const accounts = auth?.accounts ? [...auth.accounts] : [];
  if (auth && !auth.accounts && auth.refresh) {
     // Migrate single account to list
     accounts.push({
       refresh: auth.refresh,
       access: auth.access,
       expires: auth.expires,
       email: auth.email,
     });
  }

  const newRefreshParts = parseRefreshParts(newAccount.refresh);
  const existingIndex = accounts.findIndex(
    (a) => parseRefreshParts(a.refresh).refreshToken === newRefreshParts.refreshToken
  );

  if (existingIndex >= 0) {
    accounts[existingIndex] = { ...accounts[existingIndex], ...newAccount };
  } else {
    accounts.push(newAccount);
  }

  return {
    type: "oauth",
    ...newAccount,
    accounts,
  };
}

/**
 * Returns accounts that are not currently known to be exhausted.
 */
export function getAvailableAccounts(auth: OAuthAuthDetails): AccountDetails[] {
  const now = Date.now();
  const accounts = auth.accounts || [
    {
      refresh: auth.refresh,
      access: auth.access,
      expires: auth.expires,
      email: auth.email,
    },
  ];

  return accounts.filter((a) => !a.quotaExhaustedUntil || a.quotaExhaustedUntil <= now);
}

