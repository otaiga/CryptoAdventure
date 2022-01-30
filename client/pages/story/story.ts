export type StoryData = {
  p?: any[]; // description of the current scene
  audio?: any[]; // audio description of the current scene - IPFS link?
  image?: any; // image of scene - IPFS link?
  options?: { [key: string]: string }; // options available to the player
  actions?: { [key: string]: any }; // actions to set variables
  holding?: string[]; // what you are carrying
  collectable?: string; // unique nfts that are available through the game as easter eggs (if no one else has found them yet!)
  xp?: number; // how much xp gained through the game - available to cash in for credit/tokens towards another story purchase
};

export type Story = (storyVars?: { [key: string]: any }) => {
  [key: string]: StoryData;
};

export type Options = {
  [key: string]: string;
};

export interface StoryChapter {
  storyId?: string; // uuid.v4().split("-").join("")
  storyTitle?: string;
  storyImage?: string;
  storyDescription?: string;
  chapterTitle?: string;
  chapterDescription?: string;
  seq?: number;
  ipfsId?: string;
  price?: number;
}

export interface StoryChapterWithCid extends StoryChapter {
  cid: string;
}
