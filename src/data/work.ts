/* Your videos. To add one, copy a line and change the YouTube ID
   (the part after "v=" or "youtu.be/"). Order here = order on the site. */

export type Video = {
  id: string;
  title: string;
  /** Role · Deliverable · Focus (the last item also labels the clip in the hero timeline) */
  meta: string[];
  /** Optional custom thumbnail, for videos without a high-res YouTube one */
  thumb?: string;
  /** Optional zoom (e.g. 1.03) to crop thin black bars baked into a thumbnail */
  zoom?: number;
};

export const longForm: Video[] = [
  { id: 'IUX8xiyFTaY', title: 'This Lead Gen Strategy Is Boring, But It Generated $230K In 90 Days', meta: ['Client edit', 'Full long-form', 'Aqil Jannaty'], zoom: 1.016 },
  {
    id: 'fMaZWbqDzgA',
    title: "I Made 1000+ TikTok Shop Videos, Here's What Makes £££ In 2026",
    meta: ['Client edit', 'Full long-form', 'Wayne Kitula'],
    thumb: 'https://i.ytimg.com/vi/fMaZWbqDzgA/hqdefault.jpg',
  },
  { id: 'Fi7qFo-3BEc', title: 'Opening edit for Karl', meta: ['Client trial', 'Long-form intro', 'Karl'] },
  { id: 'ADEbq_VHSOA', title: '30-second edit for Will', meta: ['Client trial', '30-second cut', 'Will'] },
  { id: 'k8ZnU9B09vs', title: 'Never Recreate the Same Animation Again', meta: ['Own channel', 'Full edit', 'Motion graphics'] },
  { id: 'tJdb3OdB7I8', title: 'The Gradient Technique Nobody Shows You', meta: ['Own channel', 'Full edit', 'Tutorial'] },
];

export const shorts: Video[] = [
  { id: 'R3Y97u4cIFI', title: 'Why your videos get skipped', meta: ['Own channel', 'Editing tip'] },
  { id: 'DQnblDu2lco', title: 'Making more makes you better', meta: ['Talking head', 'Captions & motion'] },
  { id: 'RIP9H5I7CuQ', title: 'Exploring the Netherlands', meta: ['Cinematic travel', 'Color & sound'] },
  { id: 'jXmTX4UbPUk', title: 'Giving up is easy', meta: ['Motivational', 'Pacing & sound'] },
  { id: '2ijFjMWI7xs', title: 'Your story deserves better edits', meta: ['3D motion', 'Practice piece'] },
  { id: 'BzrUYwcQYhU', title: 'What are humans meant to do?', meta: ['Podcast clip', 'Captions'] },
  { id: 'YDrPMBdFfzQ', title: 'Wanting everything, doing nothing', meta: ['Aesthetic edit', 'Typography'] },
  { id: 'e3oymWJMuyY', title: 'The version that makes it', meta: ['Motion design', 'Motivational'] },
];

/** How many videos show before "Show more" */
export const longVisible = 4;
export const shortsVisible = 4;

export const thumb = {
  max: (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  mid: (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  short: (id: string) => `https://i.ytimg.com/vi/${id}/oar2.jpg`,
};
