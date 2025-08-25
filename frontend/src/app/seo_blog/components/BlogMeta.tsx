'use client'

interface BlogMetaProps {
  post: {
    author: {
      name: string
      avatar: string
      bio: string
    }
    publishedAt: string
    updatedAt: string
    readingTime: number
    category: string
  }
}

export function BlogMeta({ post }: BlogMetaProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Author Information */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
          {post.author.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {post.author.name}
            </h4>
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              작성자
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {post.author.bio}
          </p>
        </div>
      </div>

      {/* Article Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span className="text-blue-500">📅</span>
              <span className="font-medium">게시일:</span>
            </div>
            <span className="text-gray-900 dark:text-white">
              {formatDate(post.publishedAt)}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span className="text-green-500">🔄</span>
              <span className="font-medium">수정일:</span>
            </div>
            <span className="text-gray-900 dark:text-white">
              {formatDate(post.updatedAt)}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span className="text-purple-500">⏱️</span>
              <span className="font-medium">읽기 시간:</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-900 dark:text-white font-medium">
                약 {post.readingTime}분
              </span>
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, Math.ceil(post.readingTime / 3)))].map((_, i) => (
                  <div key={i} className="w-1 h-4 bg-purple-400 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span className="text-orange-500">📂</span>
              <span className="font-medium">카테고리:</span>
            </div>
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full">
              {post.category}
            </span>
          </div>
        </div>
      </div>

      {/* Reading Progress Stats */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
              {Math.ceil(post.readingTime / 2)}
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">
              단락 수
            </div>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
              {Math.ceil(post.readingTime * 200)}
            </div>
            <div className="text-xs text-green-800 dark:text-green-300 font-medium">
              예상 단어 수
            </div>
          </div>
          
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
              {post.readingTime < 5 ? '쉬움' : post.readingTime < 10 ? '보통' : '심화'}
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-300 font-medium">
              난이도
            </div>
          </div>
        </div>
      </div>

      {/* Article Timestamps (Detailed) */}
      <div className="pt-2">
        <details className="group">
          <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            상세 정보 보기
          </summary>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">최초 게시:</span>
              <span className="text-gray-800 dark:text-gray-200">{formatDateTime(post.publishedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">마지막 수정:</span>
              <span className="text-gray-800 dark:text-gray-200">{formatDateTime(post.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">문서 버전:</span>
              <span className="text-gray-800 dark:text-gray-200">v1.0</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}