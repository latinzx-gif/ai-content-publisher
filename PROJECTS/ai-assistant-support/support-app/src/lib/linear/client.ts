/**
 * Linear API client for creating issues in a team project.
 *
 * Uses the Linear GraphQL API (https://api.linear.app/graphql).
 * Auth: Bearer token from env LINEAR_API_KEY.
 * Team ID: from env LINEAR_TEAM_ID.
 */

export interface CreateLinearIssueParams {
  /** Team ID (overrides env default). */
  teamId?: string;
  /** Issue title. */
  title: string;
  /** Issue description (Markdown). */
  description: string;
  /** Label names to attach (e.g. "client:chinesevibe"). */
  labels?: string[];
}

export interface CreateLinearIssueResult {
  issue_id: string;
  issue_url: string;
}

/** GraphQL mutation to create an issue. */
const CREATE_ISSUE_MUTATION = `
  mutation CreateIssue($teamId: String!, $title: String!, $description: String!, $labelIds: [String!]) {
    issueCreate(input: {
      teamId: $teamId,
      title: $title,
      description: $description,
      labelIds: $labelIds
    }) {
      success
      issue {
        id
        url
        identifier
      }
    }
  }
`;

/** GraphQL query to find existing labels by team ID. */
const TEAM_LABELS_QUERY = `
  query TeamLabels($teamId: String!) {
    team(id: $teamId) {
      labels {
        nodes {
          id
          name
        }
      }
    }
  }
`;

/** GraphQL mutation to create a new label. */
const CREATE_LABEL_MUTATION = `
  mutation CreateLabel($teamId: String!, $name: String!) {
    issueLabelCreate(input: {
      teamId: $teamId,
      name: $name
    }) {
      success
      issueLabel {
        id
        name
      }
    }
  }
`;

/**
 * Make a raw request to the Linear GraphQL API.
 */
async function linearRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error("LINEAR_API_KEY environment variable is not set");
  }

  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    const messages = json.errors.map((e: { message: string }) => e.message).join("; ");
    throw new Error(`Linear API error: ${messages}`);
  }

  return json.data as T;
}

// ---------------------------------------------------------------------------
// Create a Linear issue
// ---------------------------------------------------------------------------

/**
 * Create a Linear issue in the configured team.
 *
 * Resolves label names to IDs (creating them if missing) in a single
 * team-labels query instead of N queries. If a label-create races and
 * the label already exists, refetches labels once to recover.
 *
 * @returns The created issue ID and URL.
 */
export async function createLinearIssue(
  params: CreateLinearIssueParams,
): Promise<CreateLinearIssueResult> {
  const teamId = params.teamId ?? process.env.LINEAR_TEAM_ID;
  if (!teamId) {
    throw new Error("LINEAR_TEAM_ID environment variable is not set, or provide teamId");
  }

  // Resolve label names → IDs
  const labelIds: string[] = [];
  if (params.labels && params.labels.length > 0) {
    // 1. Fetch all existing team labels once (not N times)
    const allLabelsData = await linearRequest<{
      team: { labels: { nodes: Array<{ id: string; name: string }> } };
    }>(TEAM_LABELS_QUERY, { teamId });

    const existingLabels = allLabelsData.team.labels.nodes;

    // 2. Match each requested label name against the fetched list
    const missingLabels: string[] = [];
    const resolvedIds: Array<string | null> = params.labels.map((name) => {
      const match = existingLabels.find(
        (l) => l.name.toLowerCase() === name.toLowerCase(),
      );
      if (match) {
        return match.id;
      }
      missingLabels.push(name);
      return null;
    });

    // Collect already-resolved IDs
    for (const id of resolvedIds) {
      if (id) labelIds.push(id);
    }

    // 3. Create any missing labels
    for (const name of missingLabels) {
      try {
        const created = await linearRequest<{
          issueLabelCreate: {
            success: boolean;
            issueLabel: { id: string; name: string };
          };
        }>(CREATE_LABEL_MUTATION, { teamId, name });

        if (created.issueLabelCreate.success) {
          labelIds.push(created.issueLabelCreate.issueLabel.id);
        } else {
          throw new Error(`Failed to create Linear label "${name}"`);
        }
      } catch {
        // Race condition: label was created by another request between our
        // query and create attempt. Refetch labels once to find the existing ID.
        const refetchData = await linearRequest<{
          team: { labels: { nodes: Array<{ id: string; name: string }> } };
        }>(TEAM_LABELS_QUERY, { teamId });

        const refound = refetchData.team.labels.nodes.find(
          (l) => l.name.toLowerCase() === name.toLowerCase(),
        );
        if (refound) {
          labelIds.push(refound.id);
        } else {
          throw new Error(
            `Failed to create Linear label "${name}" after racing`,
          );
        }
      }
    }
  }

  const data = await linearRequest<{
    issueCreate: {
      success: boolean;
      issue: { id: string; url: string; identifier: string };
    };
  }>(CREATE_ISSUE_MUTATION, {
    teamId,
    title: params.title,
    description: params.description,
    labelIds: labelIds.length > 0 ? labelIds : undefined,
  });

  if (!data.issueCreate.success) {
    throw new Error("Linear issue creation returned success=false");
  }

  return {
    issue_id: data.issueCreate.issue.id,
    issue_url: data.issueCreate.issue.url,
  };
}

// ---------------------------------------------------------------------------
// Comment on an existing Linear issue
// ---------------------------------------------------------------------------

const COMMENT_MUTATION = `
  mutation CommentOnIssue($issueId: String!, $body: String!) {
    commentCreate(input: { issueId: $issueId, body: $body }) {
      success
      comment {
        id
      }
    }
  }
`;

/**
 * Add a comment to an existing Linear issue.
 *
 * @param issueId - The Linear issue ID (UUID, not the short identifier).
 * @param body    - The comment text (supports Markdown).
 */
export async function commentOnLinearIssue(
  issueId: string,
  body: string,
): Promise<void> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error("LINEAR_API_KEY environment variable is not set");
  }

  const data = await linearRequest<{
    commentCreate: { success: boolean; comment: { id: string } };
  }>(COMMENT_MUTATION, { issueId, body });

  if (!data.commentCreate.success) {
    throw new Error("Linear comment creation returned success=false");
  }
}

// ---------------------------------------------------------------------------
// Update priority on an existing Linear issue
// ---------------------------------------------------------------------------

const UPDATE_PRIORITY_MUTATION = `
  mutation UpdateIssuePriority($issueId: String!, $priority: Float!) {
    issueUpdate(id: $issueId, input: { priority: $priority }) {
      success
      issue {
        id
      }
    }
  }
`;

/**
 * Update the priority of an existing Linear issue.
 *
 * Linear priority levels:
 *   0 = no priority
 *   1 = urgent
 *   2 = high
 *   3 = medium
 *   4 = low
 *
 * @param issueId - The Linear issue ID (UUID).
 * @param priority - The priority value (0–4).
 */
export async function updateLinearIssuePriority(
  issueId: string,
  priority: number,
): Promise<void> {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error("LINEAR_API_KEY environment variable is not set");
  }

  const data = await linearRequest<{
    issueUpdate: { success: boolean; issue: { id: string } };
  }>(UPDATE_PRIORITY_MUTATION, { issueId, priority });

  if (!data.issueUpdate.success) {
    throw new Error("Linear priority update returned success=false");
  }
}
