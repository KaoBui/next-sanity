import Link from "next/link";
import { PortableText, type SanityDocument } from "next-sanity";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { client } from "@/lib/sanity/client";

const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  _id,
  title,
  subtitle,
  heroImage,
  body,
  featuredPosts[]->{
    _id,
    title,
    slug,
    publishedAt
  }
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? createImageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function IndexPage() {
  const homePage = await client.fetch<SanityDocument | null>(
    HOME_PAGE_QUERY,
    {},
    options
  );

  if (!homePage) {
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <h1 className="mb-4 text-4xl font-bold">Home Page not set up</h1>
        <p>Create a `Home Page` document in Sanity Studio to manage this page.</p>
      </main>
    );
  }

  const heroImageUrl = homePage.heroImage
    ? urlFor(homePage.heroImage)?.width(1200).height(700).url()
    : null;

  return (
    <main className="container mx-auto min-h-screen max-w-4xl p-8">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold">{homePage.title}</h1>
          {homePage.subtitle && (
            <p className="max-w-2xl text-lg text-gray-700">{homePage.subtitle}</p>
          )}
        </div>

        {heroImageUrl && (
          <img
            src={heroImageUrl}
            alt={homePage.title}
            className="aspect-[16/9] rounded-2xl object-cover"
            width="1200"
            height="700"
          />
        )}

        {Array.isArray(homePage.body) && (
          <div className="prose max-w-none">
            <PortableText value={homePage.body} />
          </div>
        )}
      </section>

      {Array.isArray(homePage.featuredPosts) && homePage.featuredPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">Featured Posts</h2>
          <ul className="flex flex-col gap-4">
            {homePage.featuredPosts.map((post: SanityDocument) => (
              <li key={post._id}>
                <Link href={`/${post.slug.current}`} className="hover:underline">
                  <h3 className="text-xl font-medium">{post.title}</h3>
                  {post.publishedAt && (
                    <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
