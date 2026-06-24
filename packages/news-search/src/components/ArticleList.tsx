"use client";

import { useSearchStore, Article } from "@/lib/store";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function ArticleCard({ article }: { article: Article }) {
  const { toggleSave } = useSearchStore();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {article.keyword}
            </span>
            <span className="text-xs text-gray-400">{article.source}</span>
            <span className="text-xs text-gray-400">{timeAgo(article.publishedAt)}</span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 block"
          >
            {article.title}
          </a>
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{article.description}</p>
        </div>
        <button
          onClick={() => toggleSave(article.id)}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            article.saved
              ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
              : "text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"
          }`}
          title={article.saved ? "저장 취소" : "저장"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path
              fillRule="evenodd"
              d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ArticleList() {
  const { articles, isLoading, savedArticles, viewMode, setViewMode } = useSearchStore();
  const displayArticles = viewMode === "saved" ? savedArticles : articles;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => setViewMode("search")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            viewMode === "search"
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          검색 결과 ({articles.length})
        </button>
        <button
          onClick={() => setViewMode("saved")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            viewMode === "saved"
              ? "bg-yellow-500 text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          저장됨 ({savedArticles.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500" />
            <span className="ml-3 text-sm text-gray-500">기사를 검색 중...</span>
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-16 h-16 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
              />
            </svg>
            <p className="text-sm">
              {viewMode === "saved"
                ? "저장된 기사가 없습니다"
                : "왼쪽에서 카테고리와 키워드를 선택한 후 검색하세요"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
