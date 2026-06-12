import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------- helpers ----------
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pad = (n: number, len: number) => String(n).padStart(len, '0');
const weightedPick = <T>(entries: [T, number][]): T => {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [val, w] of entries) {
    if ((r -= w) <= 0) return val;
  }
  return entries[entries.length - 1][0];
};

const TODAY = new Date();
const startOfToday = () => {
  const d = new Date(TODAY);
  d.setHours(0, 0, 0, 0);
  return d;
};
const todayAt = (h: number, m = 0) => {
  const d = startOfToday();
  d.setHours(h, m, 0, 0);
  return d;
};
const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const KOREAN_FIRST = ['민준', '서연', '지호', '수아', '도윤', '하은', '시우', '지아', '건우', '예은', '주원', '서윤', '하준', '지민', '은우'];
const KOREAN_LAST = ['김', '이', '박', '최', '정', '강', '조', '윤', '임', '장', '한', '오', '서', '신', '권'];
const randomKoreanName = () => pick(KOREAN_LAST) + pick(KOREAN_FIRST);

const CITIES = [
  '서울특별시 강남구 테헤란로 152',
  '경기도 성남시 분당구 판교로 235',
  '부산광역시 해운대구 센텀중앙로 79',
  '인천광역시 연수구 송도과학로 32',
  '대구광역시 수성구 동대구로 401',
  '광주광역시 서구 상무중앙로 110',
  '대전광역시 유성구 대학로 99',
  '경기도 수원시 영통구 광교로 145',
  '강원도 춘천시 중앙로 18',
  '제주특별자치도 제주시 첨단로 242',
  '충청북도 청주시 흥덕구 가경로 50',
  '경상남도 창원시 의창구 중앙대로 250',
];
const randomPhone = () => `010-${pad(rand(1000, 9999), 4)}-${pad(rand(0, 9999), 4)}`;
const randomBarcode = () => '880' + pad(rand(0, 9999999999), 10);

async function main() {
  console.log('Clearing existing data...');
  // Delete in dependency-safe order (children -> parents)
  await prisma.alert.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.productivityLog.deleteMany();
  await prisma.workerSchedule.deleteMany();
  await prisma.dockAppointment.deleteMany();
  await prisma.pickTask.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.sOLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.wave.deleteMany();
  await prisma.receiptLine.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.pOLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.cycleCount.deleteMany();
  await prisma.dockDoor.deleteMany();
  await prisma.location.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.carrier.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shipper.deleteMany();

  // ---------- Warehouse ----------
  console.log('Creating warehouse, zones, dock doors, locations...');
  const warehouse = await prisma.warehouse.create({
    data: {
      name: '수도권 풀필먼트 센터',
      address: '경기도 이천시 마장면 物流로 123',
    },
  });

  // ---------- Zones ----------
  const zoneA = await prisma.zone.create({
    data: { warehouseId: warehouse.id, name: 'A존(일반상온)', code: 'A', type: 'STORAGE' },
  });
  const zoneB = await prisma.zone.create({
    data: { warehouseId: warehouse.id, name: 'B존(냉장)', code: 'B', type: 'COLD' },
  });
  const zoneC = await prisma.zone.create({
    data: { warehouseId: warehouse.id, name: 'C존(반품/불량)', code: 'C', type: 'RETURNS' },
  });
  const zones = [zoneA, zoneB, zoneC];

  // ---------- Dock Doors ----------
  const dockTypes = ['INBOUND', 'OUTBOUND', 'BOTH', 'INBOUND', 'OUTBOUND'];
  const dockDoors = [];
  for (let i = 1; i <= 5; i++) {
    const dd = await prisma.dockDoor.create({
      data: {
        warehouseId: warehouse.id,
        doorNumber: `D${pad(i, 2)}`,
        type: dockTypes[i - 1],
        isActive: true,
      },
    });
    dockDoors.push(dd);
  }

  // ---------- Locations (60 across 3 zones, 20 each) ----------
  const locationTypes = ['PALLET', 'SHELF', 'FLOOR', 'STAGING'];
  const locations = [];
  for (let z = 0; z < zones.length; z++) {
    const zone = zones[z];
    for (let i = 0; i < 20; i++) {
      const aisle = pad(rand(1, 5), 2);
      const bay = pad(rand(1, 10), 2);
      const level = String(rand(1, 4));
      const position = pick(['A', 'B', 'C', 'D']);
      const code = `${zone.code}-${aisle}-${bay}-${level}-${position}-${i}`;
      const loc = await prisma.location.create({
        data: {
          zoneId: zone.id,
          code,
          aisle,
          bay,
          level,
          position,
          locationType: pick(locationTypes),
          capacity: rand(50, 500),
          isActive: true,
        },
      });
      locations.push(loc);
    }
  }

  // ---------- Shippers ----------
  console.log('Creating shippers, suppliers...');
  const fashionShipper = await prisma.shipper.create({
    data: { name: '패션브랜드A(주)', code: 'SHP-FAS', contactEmail: 'fashionA@example.com' },
  });
  const healthShipper = await prisma.shipper.create({
    data: { name: '건강식품B(주)', code: 'SHP-HEALTH', contactEmail: 'healthB@example.com' },
  });
  const shippers = [fashionShipper, healthShipper];

  // ---------- Suppliers ----------
  const supplierNames = ['대한섬유', '한국식품공업', '글로벌물산', '에이스패키징', '동방물류'];
  const suppliers = [];
  for (let i = 0; i < supplierNames.length; i++) {
    const sup = await prisma.supplier.create({
      data: {
        name: supplierNames[i],
        code: `SUP-${pad(i + 1, 2)}`,
        contact: randomKoreanName() + ' / ' + randomPhone(),
      },
    });
    suppliers.push(sup);
  }

  // ---------- Items ----------
  console.log('Creating items...');
  const fashionNames = [
    '베이직 코튼 티셔츠', '슬림핏 청바지', '오버핏 후드티', '경량 패딩 점퍼', '니트 가디건',
    '치노 팬츠', '셔츠 원피스', '플리츠 스커트', '데일리 맨투맨', '울 코트',
  ];
  const foodNames = [
    '유기농 비타민C', '프로틴 쉐이크', '홍삼정', '오메가3 1000', '루테인 골드',
    '식이섬유 분말', '콜라겐 젤리', '프로바이오틱스', '마그네슘 정', '아연 비타민',
    '밀크씨슬', '종합비타민', '칼슘 마그네슘 비타민D', '코엔자임Q10', '비오틴 5000',
  ];
  const otherNames = ['친환경 수세미', '천연 주방세제', '대나무 칫솔', '극세사 청소포', '재활용 종량제봉투'];

  const items: any[] = [];
  let skuCounter = 1;

  // 10 fashion -> fashion shipper, 의류, EA
  for (const name of fashionNames) {
    const item = await prisma.item.create({
      data: {
        sku: `SKU-${pad(skuCounter, 4)}`,
        barcode: randomBarcode(),
        name,
        category: '의류',
        uom: 'EA',
        weight: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
        length: rand(20, 40),
        width: rand(15, 30),
        height: rand(2, 8),
        reorderPoint: rand(20, 100),
        supplierId: pick(suppliers).id,
        shipperId: fashionShipper.id,
      },
    });
    items.push(item);
    skuCounter++;
  }

  // 15 food -> health shipper, 식품, BOX
  for (const name of foodNames) {
    const item = await prisma.item.create({
      data: {
        sku: `SKU-${pad(skuCounter, 4)}`,
        barcode: randomBarcode(),
        name,
        category: '식품',
        uom: 'BOX',
        weight: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        length: rand(10, 25),
        width: rand(10, 20),
        height: rand(8, 20),
        reorderPoint: rand(20, 100),
        supplierId: pick(suppliers).id,
        shipperId: healthShipper.id,
      },
    });
    items.push(item);
    skuCounter++;
  }

  // 5 other -> 생활
  for (const name of otherNames) {
    const item = await prisma.item.create({
      data: {
        sku: `SKU-${pad(skuCounter, 4)}`,
        barcode: randomBarcode(),
        name,
        category: '생활',
        uom: 'EA',
        weight: parseFloat((Math.random() * 0.5 + 0.05).toFixed(2)),
        length: rand(5, 30),
        width: rand(5, 20),
        height: rand(3, 15),
        reorderPoint: rand(20, 100),
        supplierId: pick(suppliers).id,
        shipperId: pick(shippers).id,
      },
    });
    items.push(item);
    skuCounter++;
  }

  const fashionItems = items.filter((i) => i.category === '의류');
  const foodItems = items.filter((i) => i.category === '식품');

  // ---------- Carriers ----------
  console.log('Creating carriers, channels...');
  const carrierData = [
    { name: 'CJ대한통운', code: 'CJ' },
    { name: '한진택배', code: 'HANJIN' },
    { name: '롯데택배', code: 'LOTTE' },
    { name: '로젠택배', code: 'LOGEN' },
    { name: '쿠팡로지스틱스', code: 'COUPANG' },
  ];
  const carriers = [];
  for (const c of carrierData) {
    const carrier = await prisma.carrier.create({
      data: { name: c.name, code: c.code, apiUrl: `https://api.${c.code.toLowerCase()}.example.com`, isActive: true },
    });
    carriers.push(carrier);
  }

  // ---------- Channels ----------
  const channelData = [
    { name: '쿠팡', code: 'CP', type: 'B2C' },
    { name: '스마트스토어', code: 'SS', type: 'B2C' },
    { name: '자사몰', code: 'OWN', type: 'B2C' },
    { name: 'B2B 도매', code: 'B2B', type: 'B2B' },
  ];
  const channels = [];
  for (const c of channelData) {
    const channel = await prisma.channel.create({
      data: { name: c.name, code: c.code, type: c.type, isActive: true },
    });
    channels.push(channel);
  }

  // ---------- Users ----------
  console.log('Creating users...');
  const adminHash = await bcrypt.hash('admin1234', 10);
  const workerHash = await bcrypt.hash('worker1234', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@fc.com', password: adminHash, name: '관리자', role: 'ADMIN' },
  });

  const supervisor = await prisma.user.create({
    data: { email: 'supervisor@fc.com', password: workerHash, name: '현장반장', role: 'SUPERVISOR' },
  });

  const workerProfiles = [
    { name: '김민준', role: 'WMS_OP' },
    { name: '이서연', role: 'WMS_OP' },
    { name: '박지호', role: 'WMS_OP' },
    { name: '최수아', role: 'OMS_OP' },
    { name: '정도윤', role: 'OMS_OP' },
    { name: '강하은', role: 'TMS_OP' },
    { name: '조시우', role: 'TMS_OP' },
    { name: '윤지아', role: 'WMS_OP' },
    { name: '임건우', role: 'WMS_OP' },
  ];
  const workers = [];
  for (let i = 0; i < workerProfiles.length; i++) {
    const w = workerProfiles[i];
    const user = await prisma.user.create({
      data: {
        email: `worker${i + 1}@fc.com`,
        password: workerHash,
        name: w.name,
        role: w.role,
      },
    });
    workers.push(user);
  }

  // Shipper login users
  await prisma.user.create({
    data: { email: 'shipper1@fc.com', password: workerHash, name: '패션브랜드A 담당자', role: 'SHIPPER', shipperId: fashionShipper.id },
  });
  await prisma.user.create({
    data: { email: 'shipper2@fc.com', password: workerHash, name: '건강식품B 담당자', role: 'SHIPPER', shipperId: healthShipper.id },
  });

  // pool of operational workers (supervisor + workers) for task assignment / productivity
  const opWorkers = [supervisor, ...workers];

  // ---------- Inventory ----------
  console.log('Creating inventory...');
  let inventoryCount = 0;
  const lowStockItems: any[] = [];
  const itemInventoryTotals: Record<string, number> = {};

  // Force a few items to be low stock (below reorderPoint)
  const forcedLow = new Set<string>([items[0].id, items[2].id, items[12].id, items[15].id]);

  for (const item of items) {
    const isLow = forcedLow.has(item.id);
    // food items in cold zone (B), others in A; some in C as returns
    const zoneLocations = item.category === '식품'
      ? locations.filter((l) => l.code.startsWith('B'))
      : locations.filter((l) => l.code.startsWith('A'));

    const numLocations = isLow ? 1 : rand(1, 3);
    let total = 0;
    const chosen = new Set<string>();
    for (let n = 0; n < numLocations; n++) {
      const loc = pick(zoneLocations.length ? zoneLocations : locations);
      if (chosen.has(loc.id)) continue;
      chosen.add(loc.id);

      const qty = isLow ? rand(2, Math.max(3, Math.floor(item.reorderPoint / 3))) : rand(40, 400);
      total += qty;

      const isFood = item.category === '식품';
      await prisma.inventory.create({
        data: {
          locationId: loc.id,
          itemId: item.id,
          shipperId: item.shipperId,
          qty,
          lot: isFood ? `LOT-${pad(rand(1, 999), 3)}` : null,
          expiryDate: isFood ? addDays(TODAY, rand(5, 365)) : null,
        },
      });
      inventoryCount++;
    }
    itemInventoryTotals[item.id] = total;
    if (total < item.reorderPoint) lowStockItems.push(item);
  }

  // ---------- Sales Orders ----------
  console.log('Creating 150 sales orders...');
  const statusWeights: [string, number][] = [
    ['RECEIVED', 30],
    ['ALLOCATED', 25],
    ['WAVE_ASSIGNED', 18],
    ['PICKING', 15],
    ['PACKING', 10],
    ['SHIPPED', 12],
    ['DELIVERED', 10],
    ['CANCELLED', 5],
  ];
  const slaTypes = ['SAME_DAY', 'NEXT_DAY', 'STANDARD'];
  const shipmentStatusByOrder: Record<string, string> = { SHIPPED: 'IN_TRANSIT', DELIVERED: 'DELIVERED' };

  const salesOrders: any[] = [];
  for (let i = 1; i <= 150; i++) {
    const status = weightedPick(statusWeights);
    const shipper = pick(shippers);
    const channel = pick(channels);
    const sla = pick(slaTypes);
    const createdHour = rand(7, 18);
    const so = await prisma.salesOrder.create({
      data: {
        orderNumber: `SO-${TODAY.getFullYear()}${pad(TODAY.getMonth() + 1, 2)}${pad(TODAY.getDate(), 2)}-${pad(i, 4)}`,
        channelId: channel.id,
        shipperId: shipper.id,
        customerName: randomKoreanName(),
        customerAddr: pick(CITIES),
        customerPhone: randomPhone(),
        status,
        slaType: sla,
        requestedShipDate: Math.random() < 0.6 ? startOfToday() : addDays(startOfToday(), 1),
        createdAt: todayAt(createdHour, rand(0, 59)),
      },
    });

    // shipper-specific item pool
    const pool = shipper.id === fashionShipper.id ? fashionItems : foodItems;
    const lineCount = rand(1, 4);
    const usedItems = new Set<string>();
    for (let l = 0; l < lineCount; l++) {
      const item = pick(pool.length ? pool : items);
      if (usedItems.has(item.id)) continue;
      usedItems.add(item.id);
      const orderedQty = rand(1, 5);
      const pickedQty = ['PICKING', 'PACKING', 'SHIPPED', 'DELIVERED'].includes(status)
        ? orderedQty
        : 0;
      await prisma.sOLine.create({
        data: {
          soId: so.id,
          itemId: item.id,
          orderedQty,
          pickedQty,
          price: rand(5, 80) * 1000,
        },
      });
    }

    // Shipment for shipped/delivered
    if (status === 'SHIPPED' || status === 'DELIVERED') {
      const carrier = pick(carriers);
      const shippedAt = todayAt(rand(9, 17), rand(0, 59));
      await prisma.shipment.create({
        data: {
          soId: so.id,
          carrierId: carrier.id,
          trackingNumber: `${carrier.code}${pad(rand(0, 999999999), 9)}`,
          status: shipmentStatusByOrder[status],
          shippedAt,
          deliveredAt: status === 'DELIVERED' ? addDays(shippedAt, 0) : null,
          weight: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
          shippingFee: rand(2500, 5000),
        },
      });
    }

    salesOrders.push({ ...so, _status: status });
  }

  // ---------- Waves + Pick Tasks ----------
  console.log('Creating waves and pick tasks...');
  const waveAssignable = salesOrders.filter((s) =>
    ['WAVE_ASSIGNED', 'PICKING', 'PACKING'].includes(s._status)
  );

  const wave1 = await prisma.wave.create({
    data: { waveNumber: `WV-${pad(1, 4)}`, status: 'PLANNING', waveType: 'BATCH', plannedAt: todayAt(8) },
  });
  const wave2 = await prisma.wave.create({
    data: {
      waveNumber: `WV-${pad(2, 4)}`,
      status: 'RELEASED',
      waveType: 'SINGLE',
      plannedAt: todayAt(9),
      releasedAt: todayAt(10),
    },
  });

  // Assign some orders to the released wave and create pick tasks
  const wave2Orders = waveAssignable.slice(0, Math.min(8, waveAssignable.length));
  const wave1Orders = waveAssignable.slice(8, Math.min(14, waveAssignable.length));

  for (const o of wave1Orders) {
    await prisma.salesOrder.update({ where: { id: o.id }, data: { waveId: wave1.id } });
  }

  const pickStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  let pickTaskCount = 0;
  for (const o of wave2Orders) {
    await prisma.salesOrder.update({ where: { id: o.id }, data: { waveId: wave2.id } });
    const lines = await prisma.sOLine.findMany({ where: { soId: o.id } });
    for (const line of lines) {
      const status = pick(pickStatuses);
      const worker = pick(opWorkers);
      const loc = pick(locations);
      await prisma.pickTask.create({
        data: {
          waveId: wave2.id,
          soId: o.id,
          locationId: loc.id,
          itemId: line.itemId,
          qty: line.orderedQty,
          pickedQty: status === 'COMPLETED' ? line.orderedQty : status === 'IN_PROGRESS' ? rand(0, line.orderedQty) : 0,
          status,
          assignedTo: worker.id,
          startedAt: status !== 'PENDING' ? todayAt(rand(10, 12), rand(0, 59)) : null,
          completedAt: status === 'COMPLETED' ? todayAt(rand(12, 14), rand(0, 59)) : null,
        },
      });
      pickTaskCount++;
    }
  }

  // ---------- Purchase Orders ----------
  console.log('Creating purchase orders...');
  const poStatuses = ['SENT', 'ASN_RECEIVED', 'SENT'];
  const purchaseOrders = [];
  for (let i = 1; i <= 3; i++) {
    const supplier = pick(suppliers);
    const shipper = pick(shippers);
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${TODAY.getFullYear()}-${pad(i, 4)}`,
        supplierId: supplier.id,
        shipperId: shipper.id,
        status: poStatuses[i - 1],
        expectedDate: addDays(startOfToday(), rand(0, 6)),
        createdAt: addDays(todayAt(10), -rand(1, 5)),
      },
    });
    const pool = shipper.id === fashionShipper.id ? fashionItems : foodItems;
    const lineCount = rand(2, 4);
    const used = new Set<string>();
    for (let l = 0; l < lineCount; l++) {
      const item = pick(pool.length ? pool : items);
      if (used.has(item.id)) continue;
      used.add(item.id);
      const orderedQty = rand(50, 300);
      await prisma.pOLine.create({
        data: {
          poId: po.id,
          itemId: item.id,
          orderedQty,
          receivedQty: po.status === 'ASN_RECEIVED' ? rand(0, orderedQty) : 0,
        },
      });
    }
    purchaseOrders.push(po);
  }

  // ---------- Dock Appointments ----------
  console.log('Creating dock appointments...');
  const apptStatuses = ['SCHEDULED', 'ARRIVED'];
  const plateChars = ['가', '나', '다', '라', '바', '사'];
  for (let i = 0; i < 2; i++) {
    const status = apptStatuses[i];
    await prisma.dockAppointment.create({
      data: {
        dockDoorId: pick(dockDoors.filter((d) => d.type === 'INBOUND' || d.type === 'BOTH')).id,
        poId: purchaseOrders[i].id,
        type: 'INBOUND',
        vehiclePlate: `${rand(10, 99)}${pick(plateChars)}${pad(rand(0, 9999), 4)}`,
        driverName: randomKoreanName(),
        scheduledAt: todayAt(rand(8, 16), pick([0, 30])),
        arrivedAt: status === 'ARRIVED' ? todayAt(rand(8, 10), rand(0, 59)) : null,
        status,
      },
    });
  }

  // ---------- Productivity Logs ----------
  console.log('Creating productivity logs...');
  const taskTypes = ['PICKING', 'RECEIVING', 'PACKING', 'PUTAWAY'];
  let productivityCount = 0;
  for (const worker of opWorkers) {
    const numLogs = rand(2, 4);
    for (let n = 0; n < numLogs; n++) {
      await prisma.productivityLog.create({
        data: {
          workerId: worker.id,
          date: todayAt(rand(8, 17), rand(0, 59)),
          taskType: pick(taskTypes),
          quantity: rand(20, 200),
          duration: rand(30, 240),
        },
      });
      productivityCount++;
    }
  }

  // ---------- Worker Schedules ----------
  console.log('Creating worker schedules...');
  const shifts = ['MORNING', 'AFTERNOON', 'NIGHT'];
  const scheduleStatuses = ['CHECKED_IN', 'CHECKED_IN', 'SCHEDULED', 'CHECKED_OUT'];
  const zoneCodes = ['A', 'B', 'C'];
  for (const worker of opWorkers) {
    const status = pick(scheduleStatuses);
    const shift = pick(shifts);
    await prisma.workerSchedule.create({
      data: {
        workerId: worker.id,
        date: startOfToday(),
        shift,
        zone: pick(zoneCodes),
        status,
        checkedIn: status === 'CHECKED_IN' || status === 'CHECKED_OUT' ? todayAt(8, rand(0, 59)) : null,
        checkedOut: status === 'CHECKED_OUT' ? todayAt(17, rand(0, 59)) : null,
      },
    });
  }

  // ---------- Alerts ----------
  console.log('Creating alerts...');
  let alertCount = 0;
  for (const item of lowStockItems.slice(0, 5)) {
    await prisma.alert.create({
      data: {
        type: 'LOW_STOCK',
        severity: 'WARNING',
        title: '재고 부족 경고',
        message: `${item.name} (${item.sku}) 재고가 재주문점(${item.reorderPoint}) 이하입니다. 현재 ${itemInventoryTotals[item.id] ?? 0}개.`,
      },
    });
    alertCount++;
  }

  // Delayed order alert (CRITICAL)
  const delayedOrder = salesOrders.find((s) => ['PICKING', 'PACKING', 'ALLOCATED'].includes(s._status));
  await prisma.alert.create({
    data: {
      type: 'DELAYED_ORDER',
      severity: 'CRITICAL',
      title: 'SLA 지연 주문',
      message: `주문 ${delayedOrder ? delayedOrder.orderNumber : 'SO-XXXX'} 가 SLA 기한을 초과했습니다. 즉시 처리가 필요합니다.`,
    },
  });
  alertCount++;

  // Dock delay alert (WARNING)
  await prisma.alert.create({
    data: {
      type: 'DOCK_DELAY',
      severity: 'WARNING',
      title: '입고 도크 지연',
      message: `도크 ${dockDoors[0].doorNumber} 입고 차량이 예정 시간보다 지연되고 있습니다.`,
    },
  });
  alertCount++;

  // Expiry warning (INFO)
  const expiringFood = foodItems[0];
  await prisma.alert.create({
    data: {
      type: 'EXPIRY_WARNING',
      severity: 'INFO',
      title: '유통기한 임박',
      message: `${expiringFood.name} (${expiringFood.sku}) 일부 로트의 유통기한이 임박했습니다. 선입선출(FEFO) 출고를 권장합니다.`,
    },
  });
  alertCount++;

  // ---------- Summary ----------
  console.log('\n========== SEED SUMMARY ==========');
  console.log(`Warehouses:        ${await prisma.warehouse.count()}`);
  console.log(`Zones:             ${await prisma.zone.count()}`);
  console.log(`Dock Doors:        ${await prisma.dockDoor.count()}`);
  console.log(`Locations:         ${await prisma.location.count()}`);
  console.log(`Shippers:          ${await prisma.shipper.count()}`);
  console.log(`Suppliers:         ${await prisma.supplier.count()}`);
  console.log(`Items:             ${await prisma.item.count()}`);
  console.log(`Carriers:          ${await prisma.carrier.count()}`);
  console.log(`Channels:          ${await prisma.channel.count()}`);
  console.log(`Users:             ${await prisma.user.count()}`);
  console.log(`Inventory records: ${inventoryCount}`);
  console.log(`Low-stock items:   ${lowStockItems.length}`);
  console.log(`Sales Orders:      ${await prisma.salesOrder.count()}`);
  console.log(`SO Lines:          ${await prisma.sOLine.count()}`);
  console.log(`Shipments:         ${await prisma.shipment.count()}`);
  console.log(`Waves:             ${await prisma.wave.count()}`);
  console.log(`Pick Tasks:        ${pickTaskCount}`);
  console.log(`Purchase Orders:   ${await prisma.purchaseOrder.count()}`);
  console.log(`PO Lines:          ${await prisma.pOLine.count()}`);
  console.log(`Dock Appointments: ${await prisma.dockAppointment.count()}`);
  console.log(`Productivity Logs: ${productivityCount}`);
  console.log(`Worker Schedules:  ${await prisma.workerSchedule.count()}`);
  console.log(`Alerts:            ${alertCount}`);
  console.log('==================================\n');
  console.log('Login: admin@fc.com / admin1234 (ADMIN), workerN@fc.com / worker1234');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
