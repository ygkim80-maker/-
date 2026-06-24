import { NextRequest, NextResponse } from "next/server";

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

async function searchNaver(keyword: string): Promise<NaverNewsItem[]> {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) return [];

  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=5&sort=date`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  });

  if (!res.ok) return [];
  const data: NaverNewsResponse = await res.json();
  return data.items || [];
}

function generateMockArticles(keyword: string, category: string) {
  const sources = ["조선일보", "한국경제", "매일경제", "이데일리", "디지털타임스", "전자신문", "물류신문", "CLO"];
  const now = Date.now();
  return Array.from({ length: 3 }, (_, i) => ({
    id: `${keyword}-${i}-${now}`,
    title: `[${category}] ${keyword} 관련 최신 동향 - ${sources[i % sources.length]} 보도 (${i + 1})`,
    description: `${keyword}에 대한 최신 기사입니다. 업계에서는 ${keyword} 분야의 변화에 주목하고 있으며, 관련 시장이 빠르게 성장하고 있습니다.`,
    source: sources[i % sources.length],
    url: "#",
    publishedAt: new Date(now - i * 3600000).toISOString(),
    keyword,
    category,
    saved: false,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keywords = searchParams.get("keywords")?.split(",").filter(Boolean) || [];
  const category = searchParams.get("category") || "";

  if (keywords.length === 0) {
    return NextResponse.json({ articles: [] });
  }

  const useNaverApi = !!NAVER_CLIENT_ID;
  const allArticles = [];

  for (const keyword of keywords.slice(0, 10)) {
    if (useNaverApi) {
      const items = await searchNaver(keyword);
      for (let i = 0; i < items.length; i++) {
        allArticles.push({
          id: `${keyword}-${i}-${Date.now()}`,
          title: stripHtml(items[i].title),
          description: stripHtml(items[i].description),
          source: new URL(items[i].originallink || items[i].link).hostname.replace("www.", ""),
          url: items[i].originallink || items[i].link,
          publishedAt: new Date(items[i].pubDate).toISOString(),
          keyword,
          category,
          saved: false,
        });
      }
    } else {
      allArticles.push(...generateMockArticles(keyword, category));
    }
  }

  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return NextResponse.json({ articles: allArticles });
}
