export type TailorPath = "/tailor" | "/tailor/cv" | "/tailor/readiness";

export type TailorStep = {
  id: string;
  label: string;
  to: TailorPath;
};

export const TAILOR_STEPS: TailorStep[] = [
  { id: "1", label: "Overview", to: "/tailor" },
  { id: "2", label: "Tailor", to: "/tailor/cv" },
  { id: "3", label: "Review & Apply", to: "/tailor/readiness" },
];

export function getStepIndex(pathname: string) {
  const match = [...TAILOR_STEPS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((step) => pathname === step.to || pathname.startsWith(`${step.to}/`));
  return match ? TAILOR_STEPS.findIndex((step) => step.id === match.id) : 0;
}

export function getNextStep(pathname: string) {
  return TAILOR_STEPS[getStepIndex(pathname) + 1] ?? null;
}

export function getPrevStep(pathname: string) {
  const index = getStepIndex(pathname);
  return index > 0 ? TAILOR_STEPS[index - 1] : null;
}
