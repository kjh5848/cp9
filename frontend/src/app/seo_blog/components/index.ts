// SEO Blog Components
export { BlogCard } from './BlogCard'
export { BlogHero } from './BlogHero'
export { BlogFilter } from './BlogFilter'
export { BlogContent } from './BlogContent'
export { BlogTOC } from './BlogTOC'
export { BlogMeta } from './BlogMeta'
export { RelatedPosts } from './RelatedPosts'

// Types
export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  publishedAt: string
  updatedAt: string
  readingTime: number
  tags: string[]
  category: string
  featured: boolean
  seoTitle: string
  seoDescription: string
  tableOfContents?: Array<{
    id: string
    title: string
    level: number
  }>
  relatedPosts?: Array<{
    id: string
    title: string
    excerpt: string
    publishedAt: string
    readingTime: number
    category: string
  }>
}

export interface TOCItem {
  id: string
  title: string
  level: number
}

export interface RelatedPost {
  id: string
  title: string
  excerpt: string
  publishedAt: string
  readingTime: number
  category: string
}