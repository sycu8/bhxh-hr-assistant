import "dotenv/config";
import { Pool } from "pg";
import { randomUUID } from "crypto";

type FaqSeed = {
  categorySlug: string;
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  citations: Array<{
    title: string;
    sourceUrl: string;
    legalArticle?: string | null;
    legalClause?: string | null;
  }>;
};

const FAQS: FaqSeed[] = [
  {
    categorySlug: "bhxh",
    question: "Nghỉ không hưởng lương từ 14 ngày làm việc trở lên thì tháng đó có đóng BHXH không?",
    shortAnswer:
      "Thông thường, nếu người lao động không hưởng tiền lương từ 14 ngày làm việc trở lên trong tháng thì không phải đóng BHXH tháng đó (trừ các ngoại lệ theo quy định).",
    detailedAnswer:
      "Quy định này áp dụng khi NLĐ không làm việc và không hưởng lương đủ ngưỡng 14 ngày làm việc trong tháng. Một số trường hợp có ngoại lệ/điều kiện kèm theo tùy văn bản hướng dẫn và thời điểm áp dụng. Nếu tình huống liên quan nghỉ ốm/ thai sản/ tháng đầu vào làm hoặc quay lại làm, nên để HR/C&B xác minh hồ sơ và căn cứ áp dụng.",
    citations: [
      {
        title: "Chính sách online (Chính phủ) – căn cứ số ngày không hưởng lương trong tháng",
        sourceUrl:
          "http://www.chinhsachonline.chinhphu.vn/xac-dinh-dong-bhxh-can-cu-so-ngay-khong-huong-luong-trong-thang-84744.htm",
        legalArticle: null,
        legalClause: null,
      },
    ],
  },
  {
    categorySlug: "bhyt",
    question: "Thẻ BHYT dùng để làm gì và khi đi khám cần lưu ý gì?",
    shortAnswer:
      "Thẻ BHYT dùng để hưởng quyền lợi quỹ BHYT chi trả chi phí khám chữa bệnh theo mức hưởng và đúng quy định tuyến/đăng ký ban đầu.",
    detailedAnswer:
      "Khi đi khám, cần mang thẻ BHYT và giấy tờ tùy thân; lưu ý nơi đăng ký khám chữa bệnh ban đầu và quy định về chuyển tuyến. Mức hưởng phụ thuộc nhóm đối tượng và điều kiện tham gia (ví dụ tham gia đủ thời gian liên tục theo quy định).",
    citations: [
      {
        title: "BHXH Việt Nam – Lĩnh vực Bảo hiểm Y tế (BHYT)",
        sourceUrl:
          "https://baohiemxahoi.gov.vn/tintuc/Pages/linh-vuc-bao-hiem-y-te.aspx?CateID=169&ItemID=25518",
        legalArticle: null,
        legalClause: null,
      },
    ],
  },
  {
    categorySlug: "bhtn",
    question: "Điều kiện để hưởng trợ cấp thất nghiệp (BHTN) là gì?",
    shortAnswer:
      "Bạn có thể được hưởng trợ cấp thất nghiệp nếu chấm dứt HĐLĐ đúng quy định và đã đóng BHTN đủ thời gian tối thiểu (thường là từ đủ 12 tháng) trong khoảng thời gian luật định trước khi nghỉ việc, đồng thời nộp hồ sơ đúng hạn.",
    detailedAnswer:
      "Điều kiện cụ thể phụ thuộc loại hợp đồng và thời gian đóng BHTN trước khi chấm dứt. Bạn cần nộp hồ sơ tại trung tâm dịch vụ việc làm trong thời hạn luật định (thường 03 tháng kể từ ngày chấm dứt HĐLĐ).",
    citations: [
      {
        title: "Công báo Chính phủ – VBHN 3305/VBHN-BLĐTBXH (hướng dẫn Luật Việc làm về BHTN)",
        sourceUrl:
          "https://congbao.chinhphu.vn/tai-ve-van-ban-so-3305-vbhn-bldtbxh-42445-51195?format=pdf",
        legalArticle: "Điều 52 Luật Việc làm (tham chiếu)",
        legalClause: null,
      },
    ],
  },
  {
    categorySlug: "bhxh",
    question: "Quyết định 595/QĐ-BHXH liên quan gì đến việc thu BHXH/BHYT/BHTN?",
    shortAnswer:
      "Quyết định 595/QĐ-BHXH ban hành quy trình thu BHXH, BHYT, BHTN và quản lý sổ BHXH, thẻ BHYT, là căn cứ nghiệp vụ quan trọng khi thực hiện thủ tục.",
    detailedAnswer:
      "Văn bản này mô tả quy trình, hồ sơ, thời hạn xử lý và cách quản lý sổ/thẻ trong nghiệp vụ của cơ quan BHXH. Khi bạn có yêu cầu điều chỉnh thông tin, chốt sổ, hoặc thay đổi đối tượng tham gia, HR/C&B thường tham chiếu các quy trình tương ứng trong văn bản.",
    citations: [
      {
        title: "Quyết định 595/QĐ-BHXH – Quy trình thu BHXH, BHYT, BHTN (cổng TTHC địa phương)",
        sourceUrl: "https://tthc.hue.gov.vn/Content/Vanban/chitiet?iVanBan=3536",
      },
    ],
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");

  const pool = new Pool({ connectionString: url });

  const client = await pool.connect();
  try {
    await client.query("begin");

    for (const f of FAQS) {
      const cat = await client.query<{ id: string }>(
        `select id from "Category" where slug=$1 limit 1`,
        [f.categorySlug],
      );
      if (!cat.rows[0]?.id) {
        throw new Error(`Missing Category slug=${f.categorySlug}. Run seed first.`);
      }

      const inserted = await client.query<{ id: string }>(
        `
        insert into "FAQ"
          (id, question, "shortAnswer", "detailedAnswer", "categoryId", status, "confidenceLevel", "createdAt", "updatedAt")
        values
          ($5, $1, $2, $3, $4, 'APPROVED', 'HIGH', now(), now())
        returning id
        `,
        [f.question, f.shortAnswer, f.detailedAnswer, cat.rows[0].id, randomUUID()],
      );

      const faqId = inserted.rows[0]!.id;
      for (const c of f.citations) {
        await client.query(
          `
          insert into "Citation"
            (id, "faqId", title, "sourceUrl", "legalArticle", "legalClause")
          values
            ($6, $1, $2, $3, $4, $5)
          `,
          [faqId, c.title, c.sourceUrl, c.legalArticle ?? null, c.legalClause ?? null, randomUUID()],
        );
      }
    }

    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

