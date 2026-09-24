import "server-only";
import type { SourceAdapter } from "../types";
import {
  GMAIL_PROVIDER,
  getOAuthConnectionStatus,
} from "@/lib/gmail/connections";
import {
  fetchRecentInvoiceLikeMessages,
  getValidGmailAccessToken,
  type GmailMessageRow,
} from "@/lib/gmail/oauth";

export type { GmailMessageRow };

function connectedMessage(email: string | null | undefined): string {
  return email
    ? `מחובר ל־Gmail כ־${email} (קריאה בלבד)`
    : "מחובר ל־Gmail (קריאה בלבד)";
}

/** Real Gmail adapter — status from oauth_connection_status; tokens stay service-role only. */
export const gmailAdapter: SourceAdapter<GmailMessageRow> = {
  id: "gmail",
  name: "Gmail",
  category: "comms",

  async checkStatus() {
    try {
      const connection = await getOAuthConnectionStatus(GMAIL_PROVIDER);
      if (!connection) {
        return {
          state: "missing_access",
          message: "לא מחובר ל־Gmail — לחצו התחבר כדי לאשר גישה לקריאה בלבד",
        };
      }

      try {
        await getValidGmailAccessToken();
      } catch {
        return {
          state: "error",
          accountEmail: connection.connectedEmail || undefined,
          lastSynced:
            connection.lastSyncedAt || connection.updatedAt || undefined,
          message:
            "חיבור Gmail פג או בוטל — התחברו מחדש כדי לרענן את ההרשאה",
          gmailSyncEnabled: connection.gmailSyncEnabled,
        };
      }

      return {
        state: "connected",
        accountEmail: connection.connectedEmail || undefined,
        lastSynced:
          connection.lastSyncedAt || connection.updatedAt || undefined,
        message: connectedMessage(connection.connectedEmail),
        gmailSyncEnabled: connection.gmailSyncEnabled,
      };
    } catch {
      return {
        state: "error",
        message: "לא ניתן לאמת את חיבור Gmail — נסו להתחבר מחדש",
      };
    }
  },

  async fetchData() {
    try {
      return await fetchRecentInvoiceLikeMessages(15);
    } catch {
      return [];
    }
  },
};
