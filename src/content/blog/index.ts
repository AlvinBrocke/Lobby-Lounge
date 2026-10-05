import type { MDXContent } from "mdx/types";
import * as musicAndCustomerSpending from "./music-and-customer-spending.mdx";
import * as whyOneMusicLicenseIsntEnough from "./why-one-music-license-isnt-enough.mdx";
import * as howToLicenseMusicForAPublicPerformance from "./how-to-license-music-for-a-public-performance.mdx";
import * as hiddenCostOfDiyMusicLicensing from "./hidden-cost-of-diy-music-licensing.mdx";
import * as smallBusinessMusicExemption from "./small-business-music-exemption.mdx";
import * as personalSpotifyYoutubeAccount from "./personal-spotify-youtube-account.mdx";
import * as realMusicLicensingLawsuits from "./real-music-licensing-lawsuits.mdx";
import * as performingRights from "./performing-rights.mdx";
import * as backgroundMusicAndYourStaff from "./background-music-and-your-staff.mdx";
import * as whatCountsAsMusicPiracy from "./what-counts-as-music-piracy.mdx";
import * as musicThatSoundsLikeYourBrand from "./music-that-sounds-like-your-brand.mdx";
import * as musicLicensingAroundTheWorld from "./music-licensing-around-the-world.mdx";
import * as prosDirectory from "./pros-directory.mdx";

/*
 * Blog index. To add a post: drop `<slug>.mdx` in this folder (exporting
 * `meta`), then add it to `sources` below. The order here is the order the
 * posts appear in the source doc; it only breaks ties between equal dates.
 */

export type PostMeta = {
  /** "Blog > Music Licensing > …" line, verbatim from the source doc. */
  breadcrumb: string;
  /** "Published on …" line, verbatim. */
  published: string;
  /** ISO date parsed from `published`, used for sorting. */
  date: string;
  title: string;
  excerpt: string;
  cover: { src: string; width: number; height: number; alt: string } | null;
};

export type Post = PostMeta & { slug: string; category: string; Content: MDXContent };

const sources: [string, { meta: PostMeta; default: MDXContent }][] = [
  ["music-and-customer-spending", musicAndCustomerSpending],
  ["why-one-music-license-isnt-enough", whyOneMusicLicenseIsntEnough],
  ["how-to-license-music-for-a-public-performance", howToLicenseMusicForAPublicPerformance],
  ["hidden-cost-of-diy-music-licensing", hiddenCostOfDiyMusicLicensing],
  ["small-business-music-exemption", smallBusinessMusicExemption],
  ["personal-spotify-youtube-account", personalSpotifyYoutubeAccount],
  ["real-music-licensing-lawsuits", realMusicLicensingLawsuits],
  ["performing-rights", performingRights],
  ["background-music-and-your-staff", backgroundMusicAndYourStaff],
  ["what-counts-as-music-piracy", whatCountsAsMusicPiracy],
  ["music-that-sounds-like-your-brand", musicThatSoundsLikeYourBrand],
  ["music-licensing-around-the-world", musicLicensingAroundTheWorld],
  ["pros-directory", prosDirectory],
];

/** All posts, newest first. */
export const posts: Post[] = sources
  .map(([slug, mod], order) => ({
    ...mod.meta,
    slug,
    category: mod.meta.breadcrumb.split(">")[1]?.trim() ?? "Blog",
    Content: mod.default,
    order,
  }))
  .sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order)
  .map(({ order, ...post }) => post);

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

/** Other posts to suggest under an article: same category first, then newest. */
export function relatedPosts(slug: string, count = 3): Post[] {
  const current = getPost(slug);
  return posts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.category === current?.category) - Number(a.category === current?.category))
    .slice(0, count);
}
