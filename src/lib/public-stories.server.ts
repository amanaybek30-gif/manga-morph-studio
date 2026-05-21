type StoryText = { description: string | null; story_text?: string | null };

export function plotFallback(story: StoryText) {
  const source = (story.description || story.story_text || "").replace(/\s+/g, " ").trim();
  return source.length > 180 ? `${source.slice(0, 177)}…` : source || null;
}
