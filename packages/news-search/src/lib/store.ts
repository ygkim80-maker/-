import { create } from "zustand";

export interface Article {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  keyword: string;
  category: string;
  saved: boolean;
}

interface SearchState {
  articles: Article[];
  selectedCategory: string | null;
  selectedKeywords: string[];
  isLoading: boolean;
  searchQuery: string;
  savedArticles: Article[];
  viewMode: "search" | "saved";
  setSelectedCategory: (id: string | null) => void;
  toggleKeyword: (keyword: string) => void;
  setSearchQuery: (query: string) => void;
  setArticles: (articles: Article[]) => void;
  setLoading: (loading: boolean) => void;
  toggleSave: (articleId: string) => void;
  setViewMode: (mode: "search" | "saved") => void;
  clearKeywords: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  articles: [],
  selectedCategory: null,
  selectedKeywords: [],
  isLoading: false,
  searchQuery: "",
  savedArticles: [],
  viewMode: "search",
  setSelectedCategory: (id) => set({ selectedCategory: id }),
  toggleKeyword: (keyword) =>
    set((state) => ({
      selectedKeywords: state.selectedKeywords.includes(keyword)
        ? state.selectedKeywords.filter((k) => k !== keyword)
        : [...state.selectedKeywords, keyword],
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setArticles: (articles) => set({ articles }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleSave: (articleId) =>
    set((state) => {
      const article = state.articles.find((a) => a.id === articleId);
      if (!article) return state;
      const isSaved = state.savedArticles.some((a) => a.id === articleId);
      return {
        articles: state.articles.map((a) =>
          a.id === articleId ? { ...a, saved: !a.saved } : a
        ),
        savedArticles: isSaved
          ? state.savedArticles.filter((a) => a.id !== articleId)
          : [...state.savedArticles, { ...article, saved: true }],
      };
    }),
  setViewMode: (mode) => set({ viewMode: mode }),
  clearKeywords: () => set({ selectedKeywords: [] }),
}));
