"use client";

import CategorySidebar from "@/components/CategorySidebar";
import SearchHeader from "@/components/SearchHeader";
import ArticleList from "@/components/ArticleList";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <SearchHeader />
      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar />
        <ArticleList />
      </div>
    </div>
  );
}
