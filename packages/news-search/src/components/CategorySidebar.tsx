"use client";

import { KEYWORD_CATEGORIES } from "@/lib/keywords";
import { useSearchStore } from "@/lib/store";

export default function CategorySidebar() {
  const { selectedCategory, setSelectedCategory, selectedKeywords, toggleKeyword, clearKeywords } =
    useSearchStore();

  const activeCategory = KEYWORD_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">카테고리</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {KEYWORD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                clearKeywords();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex items-center gap-2 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-50"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm">{cat.name}</span>
              <span className="ml-auto text-xs text-gray-400">{cat.keywords.length}</span>
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500">키워드 선택</h3>
              {selectedKeywords.length > 0 && (
                <button
                  onClick={clearKeywords}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  초기화
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeCategory.keywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => toggleKeyword(kw)}
                  className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                    selectedKeywords.includes(kw)
                      ? "text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                  style={
                    selectedKeywords.includes(kw)
                      ? { backgroundColor: activeCategory.color }
                      : undefined
                  }
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedKeywords.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">
            선택된 키워드: <strong>{selectedKeywords.length}개</strong>
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedKeywords.map((kw) => (
              <span key={kw} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
