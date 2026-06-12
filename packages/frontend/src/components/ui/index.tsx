import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}) {
  const variants: Record<string, string> = {
    primary: 'bg-accent text-white hover:bg-sidebarHover',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    danger: 'bg-brand text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
  };
  return (
    <button
      className={`rounded-md font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const badgeColors: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
};

// Maps Korean/English statuses to colors
const statusMap: Record<string, { label: string; color: string }> = {
  // completed
  COMPLETED: { label: '완료', color: 'green' },
  SHIPPED: { label: '출하완료', color: 'green' },
  DELIVERED: { label: '배송완료', color: 'green' },
  CHECKED_OUT: { label: '퇴근', color: 'gray' },
  // in progress
  PICKING: { label: '피킹중', color: 'yellow' },
  PACKING: { label: '포장중', color: 'yellow' },
  IN_PROGRESS: { label: '진행중', color: 'yellow' },
  RECEIVING: { label: '입고중', color: 'yellow' },
  IN_TRANSIT: { label: '배송중', color: 'yellow' },
  OUT_FOR_DELIVERY: { label: '배송출발', color: 'yellow' },
  LOADING: { label: '상하차중', color: 'yellow' },
  RELEASED: { label: '진행', color: 'yellow' },
  ARRIVED: { label: '도착', color: 'yellow' },
  CHECKED_IN: { label: '출근', color: 'yellow' },
  // pending / waiting
  RECEIVED: { label: '접수', color: 'blue' },
  ALLOCATED: { label: '할당', color: 'blue' },
  WAVE_ASSIGNED: { label: '웨이브배정', color: 'blue' },
  PENDING: { label: '대기', color: 'blue' },
  DRAFT: { label: '작성중', color: 'gray' },
  SENT: { label: '발주전송', color: 'blue' },
  ASN_RECEIVED: { label: 'ASN접수', color: 'blue' },
  PLANNING: { label: '계획중', color: 'blue' },
  SCHEDULED: { label: '예약', color: 'blue' },
  LABEL_CREATED: { label: '송장생성', color: 'blue' },
  PICKED_UP: { label: '집화완료', color: 'blue' },
  // bad
  CANCELLED: { label: '취소', color: 'red' },
  FAILED: { label: '실패', color: 'red' },
  SHORT: { label: '결품', color: 'red' },
  NO_SHOW: { label: '미도착', color: 'red' },
  DAMAGED: { label: '파손', color: 'red' },
  QUARANTINE: { label: '검역', color: 'yellow' },
  GOOD: { label: '양호', color: 'green' },
};

export function StatusBadge({ status }: { status: string }) {
  const info = statusMap[status] || { label: status, color: 'gray' };
  return <Badge color={info.color}>{info.label}</Badge>;
}

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[color] || badgeColors.gray}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function Table<T extends { id?: string }>({
  columns,
  rows,
  empty = '데이터가 없습니다',
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((c) => (
              <th key={c.key} className={`text-left px-4 py-3 font-semibold text-gray-600 ${c.className || ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-400 py-10">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 text-gray-700 ${c.className || ''}`}>
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = '검색...',
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-accent"
      />
      {children}
    </div>
  );
}

export function StatCard({ label, value, suffix, color = 'text-gray-800', icon }: { label: string; value: React.ReactNode; suffix?: string; color?: string; icon?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>
        {value}
        {suffix && <span className="text-base font-medium text-gray-400 ml-1">{suffix}</span>}
      </div>
    </Card>
  );
}
