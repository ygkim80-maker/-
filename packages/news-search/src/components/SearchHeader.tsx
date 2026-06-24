"use client";

import { useSearchStore } from "@/lib/store";
import { KEYWORD_CATEGORIES } from "@/lib/keywords";
import { useCallback } from "react";

export default function SearchHeader() {
  const { selectedKeywords, selectedCategory, setArticles, setLoading, isLoading } =
    useSearchStore();

  const categoryName =
    KEYWORD_CATEGORIES.find((c) => c.id === selectedCategory)?.name || "";

  const handleSearch = useCallback(async () => {
    if (selectedKeywords.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?keywords=${encodeURIComponent(selectedKeywords.join(","))}&category=${encodeURIComponent(categoryName)}`
      );
      const data = await res.json();
      setArticles(data.articles);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedKeywords, categoryName, setArticles, setLoading]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">키워드 기사 검색</h1>
        {categoryName && (
          <span className="text-sm text-gray-400">/ {categoryName}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">
          {selectedKeywords.length > 0
            ? `${selectedKeywords.length}개 키워드 선택됨`
            : "키워드를 선택하세요"}
        </span>
        <button
          onClick={handleSearch}
          disabled={selectedKeywords.length === 0 || isLoading}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          검색
        </button>
      </div>
    </header>
  );
}
