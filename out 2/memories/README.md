# Add your memory files here

Put your real photos and videos in this folder and then update `src/data/story.ts`.

## Suggested setup

- Photos: `jpg`, `jpeg`, `png`, or `webp`
- Videos: `mp4` (best browser support)
- Keep videos short (10-25 seconds each) for fast loading
- Use simple names like `trip-2024.mp4`, `first-selfie.jpg`

## Example memory object with video

```ts
{
  id: "beach-day",
  date: "June 2024",
  title: "Beach day",
  description: "Golden hour and endless laughter.",
  media: {
    type: "video",
    src: "/memories/beach-day.mp4",
    poster: "/memories/beach-day-poster.jpg",
    alt: "Walking on the beach at sunset",
  },
}
```
