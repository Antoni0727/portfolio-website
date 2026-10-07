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
  { id: 'IUX8xiyFTaY', title: 'The $230K lead gen strategy', meta: ['Client edit', 'Long-form', 'Aqil Jannaty'], zoom: 1.016 },
  {
    id: 'fMaZWbqDzgA',
    title: 'What sells on TikTok Shop',
    meta: ['Client edit', 'Long-form', 'Wayne Kitula'],
    thumb: 'https://i.ytimg.com/vi/fMaZWbqDzgA/hqdefault.jpg',
  },
  { id: 'Fi7qFo-3BEc', title: 'Hook & intro for Karl', meta: ['Client trial', 'Long-form intro', 'Karl'] },
  { id: 'ADEbq_VHSOA', title: 'Hook & intro for Will', meta: ['Client trial', 'Long-form intro', 'Will'] },
  { id: 'yDPo9thJdZM', title: 'Counter animation in Resolve', meta: ['Own channel', 'Long-form', 'Motion graphics'] },
  { id: 'tJdb3OdB7I8', title: 'The gradient technique', meta: ['Own channel', 'Long-form', 'Tutorial'] },
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
