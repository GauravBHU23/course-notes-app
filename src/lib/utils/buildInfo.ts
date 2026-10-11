// Captured once per server process start (effectively once per deploy in
// production, since each deploy spins up a fresh process). Shown in the
// footer as "Last updated" so visitors can see the site is actively
// maintained, without needing a manual date to remember to update.
export const BUILD_TIME = new Date();

export function formatLastUpdated(): string {
  return BUILD_TIME.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
