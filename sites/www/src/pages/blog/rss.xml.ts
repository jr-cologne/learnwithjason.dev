import rss from '@astrojs/rss';
import type { AstroConfig } from 'astro';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { getHtmlFromContentCollectionEntry } from '../../util/mdx-helpers';

const parser = new MarkdownIt();

export async function GET(context: AstroConfig) {
	const blog = await getCollection('blog');

	const mdxPosts = await Promise.all(
		blog.map(async (post) => {
			const html = await getHtmlFromContentCollectionEntry(post);

			return {
				...post,
				html,
			};
		})
	);

	if (!context.site) {
		throw new Error('Setting a `site` in astro.config.mjs is required for RSS');
	}

	return rss({
		title: 'Learn With Jason Blog RSS Feed',
		description:
			'Articles and tutorials about web dev, career growth, and more.',
		site: context.site,
		items: mdxPosts
			.sort(
				(a, b) =>
					new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
			)
			.map((post) => {
				return {
					title: post.data.meta.title,
					pubDate: post.data.date,
					description: post.data.meta.description,
					link: `/blog/${post.slug}`,
					content: sanitizeHtml(post.html),
				};
			}),
	});
}
