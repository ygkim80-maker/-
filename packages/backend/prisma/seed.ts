import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Companies
  const company1 = await prisma.user.upsert({
    where: { email: 'company1@example.com' },
    update: {},
    create: {
      email: 'company1@example.com',
      password: hashedPassword,
      name: '김대표',
      phone: '010-1111-2222',
      role: 'COMPANY',
      companyName: '서울카드배송',
      businessNumber: '123-45-67890',
      companyAddress: '서울시 강남구 역삼동 123-4',
    },
  });

  const company2 = await prisma.user.upsert({
    where: { email: 'company2@example.com' },
    update: {},
    create: {
      email: 'company2@example.com',
      password: hashedPassword,
      name: '박사장',
      phone: '010-3333-4444',
      role: 'COMPANY',
      companyName: '빠른배송',
      businessNumber: '987-65-43210',
      companyAddress: '서울시 서초구 서초동 456-7',
    },
  });

  // Riders
  const rider1 = await prisma.user.upsert({
    where: { email: 'rider1@example.com' },
    update: {},
    create: {
      email: 'rider1@example.com',
      password: hashedPassword,
      name: '이기사',
      phone: '010-5555-6666',
      role: 'RIDER',
      vehicleType: 'MOTORCYCLE',
      experience: 24,
      regions: '강남,서초,송파',
      bio: '2년 경력 오토바이 배송 전문',
    },
  });

  const rider2 = await prisma.user.upsert({
    where: { email: 'rider2@example.com' },
    update: {},
    create: {
      email: 'rider2@example.com',
      password: hashedPassword,
      name: '최배달',
      phone: '010-7777-8888',
      role: 'RIDER',
      vehicleType: 'CAR',
      experience: 36,
      regions: '마포,용산,종로',
      bio: '승용차 카드배송 3년 경력',
    },
  });

  const rider3 = await prisma.user.upsert({
    where: { email: 'rider3@example.com' },
    update: {},
    create: {
      email: 'rider3@example.com',
      password: hashedPassword,
      name: '정라이더',
      phone: '010-9999-0000',
      role: 'RIDER',
      vehicleType: 'BIKE',
      experience: 6,
      regions: '강남,강동',
      bio: '자전거 배송 신입',
    },
  });

  // Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      companyId: company1.id,
      title: '강남구 신용카드 배송 라이더 모집',
      description: '강남구 일대 신용카드 배송 업무입니다. 하루 평균 30~40건 배송하며, 오토바이 또는 승용차 보유자 우대합니다.',
      cardType: 'CREDIT',
      region: '강남',
      regionDetail: '강남구 역삼동, 삼성동, 대치동',
      dailyCount: 35,
      payType: 'PER_CARD',
      payAmount: 3500,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-12-31'),
      workDays: 'MON,TUE,WED,THU,FRI',
      workStartTime: '09:00',
      workEndTime: '18:00',
      vehicleType: 'MOTORCYCLE',
      isUrgent: true,
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      companyId: company1.id,
      title: '서초구 체크카드 배송 기사 급구',
      description: '서초구 체크카드 배송 업무. 은행 체크카드 당일 배송 건으로 꼼꼼한 분 모십니다.',
      cardType: 'DEBIT',
      region: '서초',
      regionDetail: '서초구 서초동, 반포동',
      dailyCount: 25,
      payType: 'DAILY',
      payAmount: 120000,
      startDate: new Date('2026-06-20'),
      workDays: 'MON,TUE,WED,THU,FRI',
      workStartTime: '08:30',
      workEndTime: '17:30',
      isUrgent: true,
    },
  });

  const job3 = await prisma.jobPosting.create({
    data: {
      companyId: company2.id,
      title: '마포구 선불카드 배송',
      description: '마포구 선불카드 배송 업무입니다. 주 5일 근무이며 경험자 우대.',
      cardType: 'PREPAID',
      region: '마포',
      regionDetail: '마포구 상암동, 합정동',
      dailyCount: 20,
      payType: 'MONTHLY',
      payAmount: 2800000,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2027-06-30'),
      workDays: 'MON,TUE,WED,THU,FRI',
      workStartTime: '09:00',
      workEndTime: '18:00',
      vehicleType: 'CAR',
    },
  });

  const job4 = await prisma.jobPosting.create({
    data: {
      companyId: company2.id,
      title: '송파구 멤버십카드 배송 모집',
      description: '대형마트 멤버십카드 배송. 단기 프로젝트로 2주간 집중 배송입니다.',
      cardType: 'MEMBERSHIP',
      region: '송파',
      regionDetail: '송파구 잠실동, 문정동',
      dailyCount: 50,
      payType: 'PER_CARD',
      payAmount: 2500,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-14'),
      workDays: 'MON,TUE,WED,THU,FRI,SAT',
      workStartTime: '08:00',
      workEndTime: '20:00',
    },
  });

  const job5 = await prisma.jobPosting.create({
    data: {
      companyId: company1.id,
      title: '용산구 신용카드 배송 (파트타임)',
      description: '용산구 오후 파트타임 카드배송. 오후 1시~6시 근무.',
      cardType: 'CREDIT',
      region: '용산',
      regionDetail: '용산구 이태원동, 한남동',
      dailyCount: 15,
      payType: 'DAILY',
      payAmount: 70000,
      startDate: new Date('2026-06-25'),
      workDays: 'MON,TUE,WED,THU,FRI',
      workStartTime: '13:00',
      workEndTime: '18:00',
    },
  });

  const job6 = await prisma.jobPosting.create({
    data: {
      companyId: company2.id,
      title: '강동구 기타카드 배송',
      description: '강동구 교통카드 및 기타 카드류 배송 업무. 자전거 배송 가능.',
      cardType: 'OTHER',
      region: '강동',
      regionDetail: '강동구 천호동, 길동',
      dailyCount: 30,
      payType: 'PER_CARD',
      payAmount: 3000,
      startDate: new Date('2026-07-01'),
      workDays: 'MON,TUE,WED,THU,FRI',
      workStartTime: '09:00',
      workEndTime: '17:00',
      vehicleType: 'BIKE',
    },
  });

  // Applications
  await prisma.application.create({
    data: { jobId: job1.id, riderId: rider1.id, message: '강남구 2년 경력 오토바이 배송 가능합니다.' },
  });

  await prisma.application.create({
    data: { jobId: job2.id, riderId: rider1.id, message: '서초구도 배송 가능합니다.', status: 'ACCEPTED', respondedAt: new Date() },
  });

  await prisma.application.create({
    data: { jobId: job3.id, riderId: rider2.id, message: '승용차 보유, 마포구 거주입니다.' },
  });

  await prisma.application.create({
    data: { jobId: job6.id, riderId: rider3.id, message: '자전거 배송 희망합니다.' },
  });

  await prisma.application.create({
    data: { jobId: job4.id, riderId: rider1.id, message: '송파구 단기 프로젝트 참여 희망' },
  });

  // Reviews
  await prisma.review.create({
    data: { authorId: company1.id, targetId: rider1.id, jobId: job2.id, rating: 5, comment: '성실하고 빠른 배송, 추천합니다.' },
  });

  await prisma.review.create({
    data: { authorId: rider1.id, targetId: company1.id, jobId: job2.id, rating: 4, comment: '업무 환경이 좋고 급여가 정확합니다.' },
  });

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
