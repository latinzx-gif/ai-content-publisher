type ComplianceAssessmentInput = {
  riskLevel: 'low' | 'medium' | 'high';
  reviewType: string;
  contentTitle?: string | null;
};

export function buildComplianceAssessment({ riskLevel, reviewType, contentTitle }: ComplianceAssessmentInput) {
  const findings = [];

  if (riskLevel === 'high') {
    findings.push({
      severity: 'high',
      finding: 'High-risk content requires human legal/accounting approval before publishing.',
      source_reference: 'Review policy: human-in-the-loop required for high-risk claims.',
      suggested_fix: 'Add citation-backed support and require reviewer approval.',
    });
  }

  if (reviewType === 'legal' || reviewType === 'tax' || reviewType === 'accounting') {
    findings.push({
      severity: riskLevel === 'low' ? 'medium' : riskLevel,
      finding: `${reviewType} review should verify citations, professional ethics, and prohibited promise wording.`,
      source_reference: 'Rules & Brand: compliance and professional conduct guardrails.',
      suggested_fix: 'Run RAG citation check and remove unsupported guarantees.',
    });
  }

  if (!findings.length) {
    return {
      status: 'passed' as const,
      summary: `No blocking issues detected for ${contentTitle ?? 'content item'}.`,
      findings,
    };
  }

  return {
    status: findings.some((finding) => finding.severity === 'high') ? ('failed' as const) : ('warning' as const),
    summary: `${findings.length} compliance finding(s) detected for ${contentTitle ?? 'content item'}.`,
    findings,
  };
}
