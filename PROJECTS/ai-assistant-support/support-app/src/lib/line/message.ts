/**
 * LINE Messaging API helper: push Flex messages to LINE users.
 *
 * Auth: Bearer token from env LINE_CHANNEL_ACCESS_TOKEN.
 * API endpoint: https://api.line.me/v2/bot/message/push
 */

/**
 * Send a Flex confirmation message to a LINE user after ticket creation.
 *
 * @param lineUserId  The LINE user ID (recipient).
 * @param ticketCode  The generated ticket code (e.g. "AAS-123456").
 * @param clientName  The client display name.
 * @param type        The ticket type (e.g. "bug", "error").
 * @param severity    The severity level (e.g. "P0", "P1").
 * @returns           `{ success, sentAt }` — sentAt is ISO string on success,
 *                    empty string on failure.
 */
export async function sendConfirmFlex(
  lineUserId: string,
  ticketCode: string,
  clientName: string,
  type: string,
  severity: string,
): Promise<{ success: boolean; sentAt: string }> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    console.error("[line/message] LINE_CHANNEL_ACCESS_TOKEN is not set");
    return { success: false, sentAt: "" };
  }

  const liffBaseUrl = process.env.NEXT_PUBLIC_LIFF_ENDPOINT;
  if (!liffBaseUrl) {
    console.error("[line/message] NEXT_PUBLIC_LIFF_ENDPOINT is not set");
    return { success: false, sentAt: "" };
  }

  const flexMessage = {
    to: lineUserId,
    messages: [
      {
        type: "flex",
        altText: `Ticket ${ticketCode} Created`,
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "✅ Ticket Created",
                weight: "bold",
                size: "xl",
              },
              {
                type: "text",
                text: ticketCode,
                size: "xxl",
                weight: "bold",
                color: "#1DB446",
              },
              { type: "separator", margin: "xl" },
              {
                type: "box",
                layout: "vertical",
                margin: "xl",
                spacing: "sm",
                contents: [
                  { type: "text", text: `Company: ${clientName}` },
                  { type: "text", text: `Type: ${type}` },
                  { type: "text", text: `Severity: ${severity}` },
                ],
              },
              { type: "separator", margin: "xl" },
              {
                type: "text",
                text: "จะแจ้งกลับเมื่อดำเนินการเสร็จ",
                margin: "xl",
                color: "#888888",
              },
              {
                type: "button",
                style: "link",
                action: {
                  type: "uri",
                  label: "Track Status",
                  uri: `${liffBaseUrl}/liff/ticket/status`,
                },
              },
            ],
          },
        },
      },
    ],
  };

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify(flexMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[line/message] LINE push failed (${response.status}): ${errorText}`,
      );
      return { success: false, sentAt: "" };
    }

    return { success: true, sentAt: new Date().toISOString() };
  } catch (error) {
    console.error("[line/message] LINE push error:", error);
    return { success: false, sentAt: "" };
  }
}

/**
 * Send a resolution Flex message to a LINE user after a ticket is resolved.
 *
 * @param lineUserId         The LINE user ID (recipient).
 * @param ticketCode         The ticket code (e.g. "AAS-123456").
 * @param clientName         The client display name.
 * @param resolutionSummary  The resolution summary text.
 * @returns                  `{ success, sentAt }` — sentAt is ISO string on
 *                           success, empty string on failure.
 */
export async function sendResolutionFlex(
  lineUserId: string,
  ticketCode: string,
  clientName: string,
  resolutionSummary: string,
): Promise<{ success: boolean; sentAt: string }> {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!channelAccessToken) {
    console.error("[line/message] LINE_CHANNEL_ACCESS_TOKEN is not set");
    return { success: false, sentAt: "" };
  }

  const liffBaseUrl = process.env.NEXT_PUBLIC_LIFF_ENDPOINT;
  if (!liffBaseUrl) {
    console.error("[line/message] NEXT_PUBLIC_LIFF_ENDPOINT is not set");
    return { success: false, sentAt: "" };
  }

  const flexMessage = {
    to: lineUserId,
    messages: [
      {
        type: "flex",
        altText: `Ticket ${ticketCode} Resolved`,
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "✅ Ticket Resolved",
                weight: "bold",
                size: "xl",
                color: "#22C55E",
              },
              {
                type: "text",
                text: ticketCode,
                size: "xxl",
                weight: "bold",
              },
              { type: "separator", margin: "xl" },
              {
                type: "text",
                text: "Resolution:",
                weight: "bold",
                margin: "xl",
              },
              {
                type: "text",
                text: resolutionSummary,
                margin: "sm",
                wrap: true,
              },
              {
                type: "button",
                style: "link",
                action: {
                  type: "uri",
                  label: "View Details",
                  uri: `${liffBaseUrl}/liff/ticket/status?code=${ticketCode}`,
                },
              },
            ],
          },
        },
      },
    ],
  };

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify(flexMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[line/message] LINE push failed (${response.status}): ${errorText}`,
      );
      return { success: false, sentAt: "" };
    }

    return { success: true, sentAt: new Date().toISOString() };
  } catch (error) {
    console.error("[line/message] LINE push error:", error);
    return { success: false, sentAt: "" };
  }
}