import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../hooks/api';
import { SalesOrder, SOLine } from '../../types';
import { PageHeader, Table, StatusBadge, Button, Card, Column } from '../../components/ui';

const STATUS_OPTIONS = ['RECEIVED', 'ALLOCATED', 'PICKING', 'PACKING', 'SHIPPED', 'CANCELLED'];

export default function OrderDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery<SalesOrder>({
    queryKey: ['oms', 'orders', id],
    queryFn: async () => {
      const res = await api.get(`/oms/orders/${id}`);
      return res.data.data ?? res.data;
    },
    enabled: !!id,
  });

  const changeStatus = useMutation({
    mutationFn: async (status: string) => api.put(`/oms/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oms', 'orders', id] }),
  });

  const lineColumns: Column<SOLine>[] = [
    { key: 'item', header: '상품명', render: (l) => l.item?.name ?? '-' },
    { key: 'sku', header: 'SKU', render: (l) => l.item?.sku ?? '-' },
    { key: 'orderedQty', header: '주문수량' },
    { key: 'pickedQty', header: '피킹수량' },
    { key: 'price', header: '단가', render: (l) => (l.price != null ? `${l.price.toLocaleString()}원` : '-') },
  ];

  return (
    <div>
      <PageHeader
        title={`주문상세 - ${order?.orderNumber ?? ''}`}
        subtitle="판매주문 상세 정보"
        actions={
          <Button variant="secondary" onClick={() => navigate('/oms/orders')}>
            ← 목록
          </Button>
        }
      />

      {isLoading || !order ? (
        <Card className="p-10 text-center text-gray-400">불러오는 중...</Card>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">고객 정보</h3>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <select
                  value={order.status}
                  onChange={(e) => changeStatus.mutate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">고객명</span>
                <p className="font-medium text-gray-800">{order.customerName ?? '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">연락처</span>
                <p className="font-medium text-gray-800">{order.customerPhone ?? '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">배송지</span>
                <p className="font-medium text-gray-800">{order.customerAddr ?? '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">채널</span>
                <p className="font-medium text-gray-800">{order.channel?.name ?? '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">SLA</span>
                <p className="font-medium text-gray-800">{order.slaType ?? '-'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">주문 품목</h3>
            </div>
            <Table columns={lineColumns} rows={order.lines ?? []} empty="품목이 없습니다" />
          </Card>

          {order.shipment && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">배송 정보</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">택배사</span>
                  <p className="font-medium text-gray-800">{order.shipment.carrier?.name ?? '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">운송장번호</span>
                  <p className="font-medium text-gray-800">{order.shipment.trackingNumber ?? '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">배송상태</span>
                  <p className="font-medium">
                    <StatusBadge status={order.shipment.status} />
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">출하일시</span>
                  <p className="font-medium text-gray-800">
                    {order.shipment.shippedAt ? order.shipment.shippedAt.slice(0, 10) : '-'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
