import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/coming-soon'],
        },
        sitemap: 'https://skysearch.vercel.app/sitemap.xml',
    }
}
