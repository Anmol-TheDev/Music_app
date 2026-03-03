export function formatViews(views) {
  if (views == null) return;
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toString();
}
