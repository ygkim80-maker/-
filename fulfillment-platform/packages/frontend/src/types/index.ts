export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  shipperId?: string | null;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Item {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  uom: string;
  weight?: number;
  reorderPoint: number;
  shipperId?: string | null;
  shipper?: Shipper | null;
}

export interface Shipper {
  id: string;
  name: string;
  code: string;
  contactEmail?: string;
}

export interface Location {
  id: string;
  code: string;
  aisle: string;
  bay: string;
  level: string;
  position: string;
  locationType: string;
  capacity: number;
  isActive: boolean;
  zone?: { id: string; name: string; code: string; type: string };
}

export interface Inventory {
  id: string;
  qty: number;
  lot?: string;
  expiryDate?: string;
  item?: Item;
  location?: Location;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddr: string;
  customerPhone?: string;
  status: string;
  slaType: string;
  requestedShipDate?: string;
  createdAt: string;
  channel?: { id: string; name: string };
  shipper?: Shipper;
  lines?: SOLine[];
  shipment?: Shipment;
}

export interface SOLine {
  id: string;
  orderedQty: number;
  pickedQty: number;
  price: number;
  item?: Item;
}

export interface Shipment {
  id: string;
  trackingNumber?: string;
  status: string;
  shippedAt?: string;
  deliveredAt?: string;
  carrier?: { id: string; name: string; code: string };
  so?: SalesOrder;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  expectedDate?: string;
  createdAt: string;
  supplier?: { id: string; name: string };
  shipper?: Shipper;
  lines?: POLine[];
}

export interface POLine {
  id: string;
  orderedQty: number;
  receivedQty: number;
  item?: Item;
}

export interface DockAppointment {
  id: string;
  type: string;
  vehiclePlate?: string;
  driverName?: string;
  scheduledAt: string;
  arrivedAt?: string;
  status: string;
  dockDoor?: { id: string; doorNumber: string; type: string };
  po?: PurchaseOrder;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardData {
  kpis: {
    todayOrders: number;
    processedOrders: number;
    shippedOrders: number;
    inventoryAccuracy: number;
    avgProcessTime: number;
    dockUtilization: number;
  };
  dailyThroughput: { date: string; received: number; shipped: number }[];
  channelOrders: { name: string; value: number }[];
  zoneInventory: { zone: string; qty: number }[];
  workerProductivity: { name: string; qty: number }[];
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
