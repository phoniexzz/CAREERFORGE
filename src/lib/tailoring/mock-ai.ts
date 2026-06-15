import type { CoverLetterSectionId } from "./mock-data";
import { matchAnalysis, parsedJob, readinessReview } from "./mock-data";

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const wait = () => delay(450);

export async function analyseCv() {
  await wait();
  return { parsedJob, match: matchAnalysis };
}

export async function generateTailoredCv() {
  await wait();
  return { ok: true };
}

export async function generateCoverLetter() {
  await wait();
  return { ok: true };
}

const TONE_PREFIXES: Record<string, string> = {
  professional: "",
  shorter: "",
  longer: "",
  warmer: "",
  evidence: "",
  business: "",
  technical: "",
};

export async function editCoverLetterSection(
  sectionId: CoverLetterSectionId,
  currentContent: string,
  action: keyof typeof TONE_PREFIXES,
) {
  await wait();
  return {
    sectionId,
    content: TONE_PREFIXES[action] + currentContent,
  };
}

export async function regenerateSuggestion(current: string) {
  await wait();
  return current;
}

export async function runReadinessReview() {
  await wait();
  return readinessReview;
}
