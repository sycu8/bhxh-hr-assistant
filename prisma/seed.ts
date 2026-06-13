import "dotenv/config";
import {
  DocumentSourceType,
  DocumentStatus,
  FaqStatus,
  ConfidenceLevel,
} from "@prisma/client";
import { getDb } from "../src/lib/db/prisma";
import { seedCmsData } from "./seed-cms";
import { INSURANCE_CRAWL_SOURCES } from "../src/lib/crawl/allowed-sources";

async function main() {
  const prisma = getDb();
  await prisma.reviewAuditLog.deleteMany();
  await prisma.legalUpdate.deleteMany();
  await prisma.crawlItem.deleteMany();
  await prisma.crawlKeyword.deleteMany();
  await prisma.crawlSource.deleteMany();
  await prisma.citation.deleteMany();
  await prisma.questionLog.deleteMany();
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.category.deleteMany();

  const cats = await prisma.$transaction([
    prisma.category.create({
      data: {
        name: "BHXH bắt buộc",
        slug: "bhxh",
        description: "Bảo hiểm xã hội bắt buộc",
      },
    }),
    prisma.category.create({
      data: {
        name: "BHYT",
        slug: "bhyt",
        description: "Bảo hiểm y tế",
      },
    }),
    prisma.category.create({
      data: {
        name: "BHTN",
        slug: "bhtn",
        description: "Bảo hiểm thất nghiệp",
      },
    }),
    prisma.category.create({
      data: {
        name: "Thai sản",
        slug: "thai-san",
        description: "Chế độ thai sản",
      },
    }),
  ]);

  const [catBhxh, catBhyt, catBhtn, catThaiSan] = cats;

  await prisma.crawlSource.createMany({
    data: INSURANCE_CRAWL_SOURCES,
    skipDuplicates: true,
  });

  const keywordRows = [
    ["bảo hiểm xã hội", catBhxh.id],
    ["BHXH", catBhxh.id],
    ["bảo hiểm y tế", catBhyt.id],
    ["BHYT", catBhyt.id],
    ["bảo hiểm thất nghiệp", catBhtn.id],
    ["BHTN", catBhtn.id],
    ["tai nạn lao động", catBhxh.id],
    ["bệnh nghề nghiệp", catBhxh.id],
    ["thai sản", catThaiSan.id],
    ["chế độ thai sản", catThaiSan.id],
    ["chế độ ốm đau", catBhxh.id],
    ["hưu trí", catBhxh.id],
    ["tử tuất", catBhxh.id],
    ["người lao động", null],
    ["người sử dụng lao động", null],
    ["doanh nghiệp đóng bảo hiểm", null],
    ["mức đóng bảo hiểm", catBhxh.id],
    ["tiền lương tháng đóng bảo hiểm", catBhxh.id],
    ["trợ cấp thất nghiệp", catBhtn.id],
    ["khám chữa bệnh bảo hiểm y tế", catBhyt.id],
    ["sổ bảo hiểm xã hội", catBhxh.id],
    ["mã số bảo hiểm xã hội", catBhxh.id],
    ["bảo hiểm bắt buộc", catBhxh.id],
    ["nghỉ việc", null],
    ["nghỉ không lương", null],
    ["hợp đồng lao động", null],
    ["luật bảo hiểm xã hội", catBhxh.id],
    ["luật bảo hiểm y tế", catBhyt.id],
    ["luật việc làm", catBhtn.id],
    ["bộ luật lao động", null],
    ["nghị định", null],
    ["thông tư", null],
    ["quyết định", null],
    ["công văn hướng dẫn", null],
    ["luật dân số", catThaiSan.id],
    ["nghị định 168", catThaiSan.id],
    ["lương cơ sở", catBhxh.id],
    ["sàng lọc thai", catThaiSan.id],
    ["hỗ trợ sinh con", catThaiSan.id],
  ] as const;

  await prisma.crawlKeyword.createMany({
    data: keywordRows.map(([keyword, categoryId]) => ({
      keyword,
      categoryId,
      active: true,
    })),
    skipDuplicates: true,
  });

  const doc = await prisma.document.create({
    data: {
      title: "Luật Bảo hiểm xã hội (trích yếu — dữ liệu mẫu MVP)",
      fileName: "sample-bhxh.txt",
      fileType: "text/plain",
      sourceType: DocumentSourceType.MANUAL,
      status: DocumentStatus.APPROVED,
      version: 1,
      categoryId: catBhxh.id,
      storagePath: "/uploads/sample-policy.txt",
    },
  });

  await prisma.document.create({
    data: {
      title: "Chính sách phúc lợi nội bộ (bản nháp — chờ HR duyệt)",
      fileName: "phuc-loi-noi-bo-draft.pdf",
      fileType: "application/pdf",
      sourceType: DocumentSourceType.UPLOAD,
      status: DocumentStatus.PENDING_REVIEW,
      version: 1,
      categoryId: catBhyt.id,
      storagePath: "/uploads/pending/phuc-loi-draft.pdf",
    },
  });

  const qd366 = await prisma.document.create({
    data: {
      title:
        "366/QĐ-BHXH (29/4/2026) — Quy trình thu BHXH, BHYT, BHTN; sổ BHXH, thẻ BHYT",
      fileName: "366-QD-BHXH-2026.pdf",
      fileType: "application/pdf",
      sourceType: DocumentSourceType.UPLOAD,
      status: DocumentStatus.APPROVED,
      version: 1,
      categoryId: catBhxh.id,
      storagePath: "/docs/366-QD-BHXH-2026.pdf",
    },
  });

  await prisma.documentChunk.createMany({
    data: [
      {
        documentId: doc.id,
        chunkIndex: 0,
        content:
          "Điều 85 Luật Bảo hiểm xã hội 2024 quy định về hồ sơ và thủ tục hưởng bảo hiểm xã hội. " +
          "Người lao động nộp hồ sơ theo quy định của pháp luật và được cơ quan bảo hiểm xã hội giải quyết trong thời hạn luật định.",
        metadata: {
          legalArticle: "Điều 85",
          legalClause: "Khoản 1",
        },
      },
      {
        documentId: doc.id,
        chunkIndex: 1,
        content:
          "Về đóng bảo hiểm xã hội: người lao động và người sử dụng lao động đóng BHXH, BHYT, BHTN " +
          "theo tỷ lệ do Chính phủ quy định trên cơ sở mức lương làm căn cứ đóng bảo hiểm xã hội.",
        metadata: {
          legalArticle: "Các điều khoản về đóng BHXH",
          legalClause: null,
        },
      },
      {
        documentId: qd366.id,
        chunkIndex: 0,
        content:
          "Quyết định số 366/QĐ-BHXH (Hà Nội, ngày 29 tháng 4 năm 2026): ban hành Quy trình thu bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp; " +
          "cấp sổ bảo hiểm xã hội, thẻ bảo hiểm y tế (theo trang bìa PDF /docs/366-QD-BHXH-2026.pdf). " +
          "Sau khi chạy `pnpm run pdf:ocr-import`, các điều khoản chi tiết được lưu thêm trong các chunk OCR.",
        metadata: {
          legalArticle: "366/QĐ-BHXH",
          legalClause: null,
        },
      },
    ],
  });

  const faqs = [
    {
      q: "Tôi có bắt buộc phải tham gia BHXH không?",
      short:
        "Đối với giao dịch lao động thuộc phạm vi Luật Lao động, người sử dụng lao động và người lao động phải tham gia BHXH, BHYT, BHTN theo quy định.",
      long: "Trừ các trường hợp miễn, giảm hoặc không thuộc đối tượng theo luật chuyên ngành, hợp đồng lao động thông thường phải đóng đủ các loại bảo hiểm bắt buộc.",
      catId: catBhxh.id,
    },
    {
      q: "Nghỉ thai sản được hưởng chế độ như thế nào?",
      short:
        "Chế độ thai sản gồm thời gian nghỉ, mức hưởng và điều kiện đóng BHXH — cần đủ thời gian đóng trước khi sinh theo quy định hiện hành.",
      long: "Chi tiết mức hưởng và số ngày nghỉ phụ thuộc quy định pháp luật tại thời điểm giải quyết và hồ sơ lao động.",
      catId: catThaiSan.id,
    },
    {
      q: "Thẻ BHYT dùng để làm gì?",
      short:
        "Thẻ BHYT giúp người tham gia được quỹ BHYT chi trả một phần chi phí khám chữa bệnh theo danh mục và tuyến bệnh viện.",
      long: "Mức hưởng và phạm vi chi trả theo quy định Bộ Y tế và BHXH Việt Nam.",
      catId: catBhyt.id,
    },
  ];

  for (const f of faqs) {
    const faq = await prisma.fAQ.create({
      data: {
        question: f.q,
        shortAnswer: f.short,
        detailedAnswer: f.long,
        categoryId: f.catId,
        status: FaqStatus.APPROVED,
        confidenceLevel: ConfidenceLevel.HIGH,
      },
    });
    await prisma.citation.create({
      data: {
        faqId: faq.id,
        title: "Căn cứ pháp luật (mẫu seed)",
        legalArticle: "Luật BHXH / Luật BHYT (tham chiếu)",
        legalClause: "Theo từng trường hợp cụ thể",
      },
    });
  }

  console.log(
    "Seed completed: categories, document+chunks, FAQs with citations.",
  );

  await seedCmsData();
}

main()
  .then(() => getDb().$disconnect())
  .catch((e) => {
    console.error(e);
    getDb().$disconnect();
    process.exit(1);
  });
