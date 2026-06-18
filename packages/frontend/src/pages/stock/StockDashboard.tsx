import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../hooks/api';
import { Card, PageHeader, Badge } from '../../components/ui';

interface IndexData {
  name: string;
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  prevClose: number | null;
  high52w: number | null;
  low52w: number | null;
}

interface StockQuote {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
  sharesOutstanding: number | null;
  per: number | null;
  pbr: number | null;
  volume: number | null;
  high52w: number | null;
  low52w: number | null;
  prevClose: number | null;
  currency: string;
}

interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  sharesOutstanding: number;
  per: number | null;
  forwardPer: number | null;
  pbr: number | null;
  volume: number;
  avgVolume: number;
  high52w: number;
  low52w: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  currency: string;
  eps: number | null;
  beta: number | null;
  dividendYield: number | null;
  roe: number | null;
  debtToEquity: number | null;
}

interface QuotesResponse {
  market: string;
  index: IndexData;
  quotes: StockQuote[];
  updatedAt: string;
  isLive: boolean;
}

type MarketTab = 'kospi' | 'sp500' | 'nasdaq';

const MARKETS: { key: MarketTab; label: string; flag: string }[] = [
  { key: 'kospi', label: 'KOSPI', flag: '🇰🇷' },
  { key: 'sp500', label: 'S&P 500', flag: '🇺🇸' },
  { key: 'nasdaq', label: 'NASDAQ', flag: '🇺🇸' },
];

function formatNumber(n: number | null, decimals = 2): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatLargeNumber(n: number | null, currency: string): string {
  if (n === null || n === undefined) return '-';
  if (currency === 'KRW') {
    if (n >= 1e12) return `${(n / 1e12).toFixed(1)}조`;
    if (n >= 1e8) return `${(n / 1e8).toFixed(0)}억`;
    return n.toLocaleString();
  }
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function formatShares(n: number | null): string {
  if (n === null || n === undefined) return '-';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}만`;
  return n.toLocaleString();
}

function formatVolume(n: number | null): string {
  if (n === null || n === undefined) return '-';
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

function PriceChange({ change, changePercent }: { change: number | null; changePercent: number | null }) {
  if (change === null || changePercent === null) return <span className="text-gray-400">-</span>;
  const isUp = change > 0;
  const isDown = change < 0;
  const color = isUp ? 'text-red-500' : isDown ? 'text-blue-500' : 'text-gray-500';
  const arrow = isUp ? '▲' : isDown ? '▼' : '';
  return (
    <span className={`font-medium ${color}`}>
      {arrow} {formatNumber(Math.abs(change))} ({formatNumber(Math.abs(changePercent))}%)
    </span>
  );
}

function DetailModal({ symbol, onClose }: { symbol: string; onClose: () => void }) {
  const { data, isLoading } = useQuery<StockDetail>({
    queryKey: ['stock-detail', symbol],
    queryFn: () => api.get(`/stock/detail/${symbol}`).then((r) => r.data),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {isLoading || !data ? (
          <div className="p-10 text-center text-gray-400">로딩 중...</div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{data.name}</h3>
                <span className="text-sm text-gray-500">{data.symbol}</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-800">
                  {data.currency === 'KRW' ? '₩' : '$'}{formatNumber(data.price, data.currency === 'KRW' ? 0 : 2)}
                </span>
                <PriceChange change={data.change} changePercent={data.changePercent} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricItem label="시가총액" value={formatLargeNumber(data.marketCap, data.currency)} />
                <MetricItem label="발행주식수" value={formatShares(data.sharesOutstanding)} />
                <MetricItem label="PER" value={data.per ? formatNumber(data.per) : '-'} />
                <MetricItem label="Forward PER" value={data.forwardPer ? formatNumber(data.forwardPer) : '-'} />
                <MetricItem label="PBR" value={data.pbr ? formatNumber(data.pbr) : '-'} />
                <MetricItem label="EPS" value={data.eps ? formatNumber(data.eps) : '-'} />
                <MetricItem label="거래량" value={formatVolume(data.volume)} />
                <MetricItem label="평균거래량" value={formatVolume(data.avgVolume)} />
                <MetricItem label="전일종가" value={formatNumber(data.prevClose, data.currency === 'KRW' ? 0 : 2)} />
                <MetricItem label="Beta" value={data.beta ? formatNumber(data.beta) : '-'} />
                <MetricItem label="52주 최고" value={formatNumber(data.high52w, data.currency === 'KRW' ? 0 : 2)} />
                <MetricItem label="52주 최저" value={formatNumber(data.low52w, data.currency === 'KRW' ? 0 : 2)} />
                <MetricItem label="일중 최고" value={formatNumber(data.dayHigh, data.currency === 'KRW' ? 0 : 2)} />
                <MetricItem label="일중 최저" value={formatNumber(data.dayLow, data.currency === 'KRW' ? 0 : 2)} />
                <MetricItem label="배당수익률" value={data.dividendYield ? `${formatNumber(data.dividendYield * 100)}%` : '-'} />
                <MetricItem label="ROE" value={data.roe ? `${formatNumber(data.roe * 100)}%` : '-'} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
    </div>
  );
}

export default function StockDashboard() {
  const [market, setMarket] = useState<MarketTab>('kospi');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>('marketCap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const { data, isLoading, dataUpdatedAt } = useQuery<QuotesResponse>({
    queryKey: ['stock-quotes', market],
    queryFn: () => api.get(`/stock/quotes?market=${market}`).then((r) => r.data),
    refetchInterval: 60000,
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredQuotes = (data?.quotes || [])
    .filter((q) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return q.name.toLowerCase().includes(s) || q.symbol.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortKey] ?? -Infinity;
      const bVal = (b as any)[sortKey] ?? -Infinity;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const isKRW = market === 'kospi';
  const currencySymbol = isKRW ? '₩' : '$';

  return (
    <div>
      <PageHeader
        title="주식 시세 대시보드"
        subtitle="실시간 시세 조회 · KOSPI / S&P 500 / NASDAQ"
        actions={
          <div className="flex items-center gap-2">
            {data && (
              <span className="text-xs text-gray-400">
                {data.isLive && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />}
                {new Date(data.updatedAt).toLocaleTimeString('ko-KR')} 기준
              </span>
            )}
          </div>
        }
      />

      {/* Market Tabs */}
      <div className="flex gap-2 mb-6">
        {MARKETS.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMarket(m.key); setSearch(''); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              market === m.key
                ? 'bg-accent text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className="mr-1.5">{m.flag}</span>
            {m.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3" />
            <p>시세 데이터를 불러오는 중...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Index Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-5 col-span-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">{data.index.name} 지수</div>
                  <div className="text-3xl font-bold text-gray-800">
                    {data.index.price !== null ? formatNumber(data.index.price, 2) : '-'}
                  </div>
                  <div className="mt-1">
                    <PriceChange change={data.index.change} changePercent={data.index.changePercent} />
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>전일종가: {data.index.prevClose ? formatNumber(data.index.prevClose, 2) : '-'}</div>
                  <div>52주 최고: {data.index.high52w ? formatNumber(data.index.high52w, 2) : '-'}</div>
                  <div>52주 최저: {data.index.low52w ? formatNumber(data.index.low52w, 2) : '-'}</div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-sm text-gray-500 mb-1">상승 종목</div>
              <div className="text-3xl font-bold text-red-500">
                {data.quotes.filter((q) => q.change !== null && q.change > 0).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">/ {data.quotes.length} 종목</div>
            </Card>

            <Card className="p-5">
              <div className="text-sm text-gray-500 mb-1">하락 종목</div>
              <div className="text-3xl font-bold text-blue-500">
                {data.quotes.filter((q) => q.change !== null && q.change < 0).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">/ {data.quotes.length} 종목</div>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="종목명 또는 심볼로 검색..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Stock Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <SortHeader label="종목명" sortKey="name" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="min-w-[160px]" />
                    <SortHeader label="현재가" sortKey="price" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <SortHeader label="등락률" sortKey="changePercent" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <SortHeader label="시가총액" sortKey="marketCap" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <SortHeader label="발행주식수" sortKey="sharesOutstanding" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <SortHeader label="PER" sortKey="per" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <SortHeader label="PBR" sortKey="pbr" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <SortHeader label="거래량" sortKey="volume" currentKey={sortKey} dir={sortDir} onSort={handleSort} className="text-right" />
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">52주</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-10">
                        {search ? '검색 결과가 없습니다' : '데이터가 없습니다'}
                      </td>
                    </tr>
                  ) : (
                    filteredQuotes.map((q) => (
                      <tr
                        key={q.symbol}
                        className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedSymbol(q.symbol)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{q.name}</div>
                          <div className="text-xs text-gray-400">{q.symbol}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800">
                          {currencySymbol}{formatNumber(q.price, isKRW ? 0 : 2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <PriceChange change={q.change} changePercent={q.changePercent} />
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatLargeNumber(q.marketCap, q.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatShares(q.sharesOutstanding)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <PerBadge value={q.per} type="per" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <PerBadge value={q.pbr} type="pbr" />
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 font-mono">
                          {formatVolume(q.volume)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {q.high52w !== null && q.low52w !== null && q.price !== null ? (
                            <FiftyTwoWeekBar low={q.low52w} high={q.high52w} current={q.price} />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      {selectedSymbol && (
        <DetailModal symbol={selectedSymbol} onClose={() => setSelectedSymbol(null)} />
      )}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  className = '',
}: {
  label: string;
  sortKey: string;
  currentKey: string;
  dir: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
}) {
  const active = sortKey === currentKey;
  return (
    <th
      className={`px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      {active && <span className="ml-1 text-accent">{dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );
}

function PerBadge({ value, type }: { value: number | null; type: 'per' | 'pbr' }) {
  if (value === null || value === undefined) return <span className="text-gray-400">-</span>;

  let color = 'gray';
  if (type === 'per') {
    if (value < 10) color = 'green';
    else if (value < 20) color = 'blue';
    else if (value < 40) color = 'yellow';
    else color = 'red';
  } else {
    if (value < 1) color = 'green';
    else if (value < 3) color = 'blue';
    else if (value < 5) color = 'yellow';
    else color = 'red';
  }

  return <Badge color={color}>{formatNumber(value)}</Badge>;
}

function FiftyTwoWeekBar({ low, high, current }: { low: number; high: number; current: number }) {
  const range = high - low;
  const position = range > 0 ? ((current - low) / range) * 100 : 50;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full relative">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent border-2 border-white shadow-sm"
          style={{ left: `${Math.min(Math.max(position, 0), 100)}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between w-20 text-[10px] text-gray-400">
        <span>L</span>
        <span>H</span>
      </div>
    </div>
  );
}
