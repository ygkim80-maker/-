import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}
interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  { items: [{ to: '/', label: '대시보드', icon: '📊' }] },
  {
    title: 'WMS 창고관리',
    items: [
      { to: '/wms/inbound', label: '입고관리', icon: '📦' },
      { to: '/wms/receiving', label: '입고처리', icon: '📥' },
      { to: '/wms/inventory', label: '재고현황', icon: '🏪' },
      { to: '/wms/locations', label: '로케이션', icon: '📍' },
      { to: '/wms/items', label: '상품마스터', icon: '🏷️' },
      { to: '/wms/cycle-count', label: '사이클카운트', icon: '🔢' },
      { to: '/wms/outbound', label: '출고관리', icon: '🚚' },
      { to: '/wms/picking', label: '피킹', icon: '✋' },
    ],
  },
  {
    title: 'OMS 주문관리',
    items: [
      { to: '/oms/orders', label: '주문관리', icon: '📋' },
      { to: '/oms/channels', label: '채널관리', icon: '🛒' },
    ],
  },
  {
    title: 'TMS 배송관리',
    items: [
      { to: '/tms/shipments', label: '배송현황', icon: '🚛' },
      { to: '/tms/carriers', label: '배송사', icon: '🏬' },
    ],
  },
  {
    title: 'YMS 야드관리',
    items: [{ to: '/yms/dock', label: '도크스케줄', icon: '🏭' }],
  },
  {
    title: 'LMS 인력관리',
    items: [
      { to: '/lms/workers', label: '작업자관리', icon: '👥' },
      { to: '/lms/tasks', label: '작업배정', icon: '🗂️' },
      { to: '/lms/productivity', label: '생산성', icon: '📈' },
    ],
  },
  {
    title: '현장 모니터링',
    items: [
      { to: '/monitoring/cctv', label: 'CCTV 모니터링', icon: '📹' },
      { to: '/monitoring/sensor', label: '온습도 모니터링', icon: '🌡️' },
    ],
  },
  {
    title: '기타',
    items: [
      { to: '/shipper', label: '화주포털', icon: '🏢' },
      { to: '/ai', label: 'AI 어시스턴트', icon: '🤖' },
      { to: '/reports', label: '리포트', icon: '📑' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-sidebar text-gray-300 flex flex-col h-screen overflow-y-auto shrink-0">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-white font-bold text-lg leading-tight">풀필먼트 센터</div>
        <div className="text-xs text-gray-400 mt-0.5">통합 IT 플랫폼</div>
      </div>
      <nav className="flex-1 py-3">
        {sections.map((sec, i) => (
          <div key={i} className="mb-2">
            {sec.title && (
              <div className="px-5 py-1.5 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                    isActive ? 'bg-brand text-white border-r-2 border-white' : 'hover:bg-sidebarHover'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-5 py-3 text-[11px] text-gray-500 border-t border-white/10">v1.0.0 · 수도권 FC</div>
    </aside>
  );
}
