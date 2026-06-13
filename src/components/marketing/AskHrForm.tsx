"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  TurnstileWidget,
  isTurnstileRequiredOnClient,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HR_CONTACT_EMAIL } from "@/lib/copy/hr-contact";
import {
  ASK_HR_TOPIC_VALUES,
  ASK_HR_URGENT_VALUES,
  isAskHrFormReady,
  isAskHrTopicValue,
  isAskHrUrgentValue,
  type AskHrTopicValue,
  type AskHrUrgentValue,
} from "@/lib/validators/ask-hr-form";

const TOPIC_LABELS: Record<AskHrTopicValue, string> = {
  bhxh: "BHXH",
  bhyt: "BHYT",
  bhtn: "BHTN",
  "thai-san": "Thai sản",
  khac: "Khác",
};

const URGENT_LABELS: Record<AskHrUrgentValue, string> = {
  normal: "Bình thường",
  soon: "Cần phản hồi trong vài ngày",
  urgent: "Khẩn",
};

type AskHrFormProps = {
  initialQuestion?: string;
  initialDetail?: string;
  initialTopic?: string;
};

type SubmitState = "idle" | "sending" | "success" | "error";

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

export function AskHrForm({
  initialQuestion,
  initialDetail,
  initialTopic,
}: AskHrFormProps) {
  const [replyEmail, setReplyEmail] = useState("");
  const [topic, setTopic] = useState<AskHrTopicValue | "">(() =>
    initialTopic && isAskHrTopicValue(initialTopic) ? initialTopic : "",
  );
  const [urgent, setUrgent] = useState<AskHrUrgentValue | "">("");
  const [question, setQuestion] = useState(initialQuestion?.trim() ?? "");
  const [detail, setDetail] = useState(initialDetail?.trim() ?? "");
  const [agree, setAgree] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileRequired = isTurnstileRequiredOnClient();

  const canSubmit = useMemo(
    () =>
      isAskHrFormReady({
        question,
        replyEmail,
        topic,
        urgent,
        agree,
      }) && (!turnstileRequired || Boolean(turnstileToken)),
    [question, replyEmail, topic, urgent, agree, turnstileRequired, turnstileToken],
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || submitState === "sending") return;
    if (!isAskHrTopicValue(topic) || !isAskHrUrgentValue(urgent)) return;

    setSubmitState("sending");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ask-hr/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          detail: detail.trim(),
          topic,
          urgent,
          replyEmail: replyEmail.trim(),
          turnstileToken: turnstileToken ?? undefined,
        }),
      });

      const body = (await response.json()) as {
        success?: boolean;
        data?: { ticketNumber?: string; notifyEmailSent?: boolean };
        error?: { message?: string };
      };

      if (!response.ok || !body.success) {
        throw new Error(
          body.error?.message ?? "Không tạo được ticket. Vui lòng thử lại.",
        );
      }

      setTicketNumber(body.data?.ticketNumber ?? null);
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không gửi được email. Vui lòng thử lại.",
      );
    }
  };

  if (submitState === "success") {
    return (
      <Card className="mx-auto max-w-2xl border-emerald-200 bg-emerald-50/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-950">Đã tạo ticket HR</CardTitle>
          <CardDescription className="text-pretty leading-relaxed text-emerald-900/80">
            {ticketNumber ? (
              <>
                Mã ticket: <strong>{ticketNumber}</strong>. HR/C&amp;B ({HR_CONTACT_EMAIL})
                sẽ xử lý và phản hồi qua email công ty bạn đã nhập.
              </>
            ) : (
              <>
                Câu hỏi của bạn đã được ghi nhận. HR/C&amp;B ({HR_CONTACT_EMAIL}) sẽ
                phản hồi qua email công ty khi xử lý xong.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() => {
              setSubmitState("idle");
              setTicketNumber(null);
              setReplyEmail("");
              setTopic("");
              setUrgent("");
              setQuestion("");
              setDetail("");
              setAgree(false);
              setTurnstileToken(null);
              turnstileRef.current?.reset();
            }}
          >
            Gửi câu hỏi khác
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl border-amber-200 bg-amber-50/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Soạn câu hỏi cho HR/C&amp;B</CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          Điền đủ các trường bắt buộc (<RequiredMark />) để nút gửi được bật. Giữ câu
          hỏi ngắn gọn; không nhập mã BHXH, CCCD, chi tiết lương hoặc bệnh án nếu
          không cần. Email gửi qua Cloudflare tới {HR_CONTACT_EMAIL}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={submit}
          className="space-y-4"
          noValidate
          aria-label="Gửi câu hỏi tới HR"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="replyEmail">
              Email của bạn <RequiredMark />
            </label>
            <input
              id="replyEmail"
              name="replyEmail"
              type="email"
              required
              value={replyEmail}
              onChange={(e) => setReplyEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
              placeholder="ten.ban@fpt.com"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="topic">
                Chủ đề <RequiredMark />
              </label>
              <select
                id="topic"
                name="topic"
                required
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value && isAskHrTopicValue(e.target.value)
                      ? e.target.value
                      : "",
                  )
                }
              >
                <option value="" disabled>
                  Chọn chủ đề
                </option>
                {ASK_HR_TOPIC_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {TOPIC_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="urgent">
                Mức khẩn cấp <RequiredMark />
              </label>
              <select
                id="urgent"
                name="urgent"
                required
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
                value={urgent}
                onChange={(e) =>
                  setUrgent(
                    isAskHrUrgentValue(e.target.value) ? e.target.value : "",
                  )
                }
              >
                <option value="" disabled>
                  Chọn mức khẩn
                </option>
                {ASK_HR_URGENT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {URGENT_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="q">
              Câu hỏi cần HR xác minh <RequiredMark />
            </label>
            <textarea
              id="q"
              name="question"
              required
              minLength={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[112px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Ví dụ: Em nghỉ không lương 2 tháng có ảnh hưởng đóng BHXH không?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="detail">
              Căn cứ đã kiểm tra hoặc ghi chú thêm
            </label>
            <textarea
              id="detail"
              name="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="min-h-[84px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Ví dụ: Đã tra cứu nhưng câu trả lời báo cần HR xác minh."
            />
          </div>

          <label className="flex items-start gap-2 text-sm leading-snug">
            <input
              type="checkbox"
              name="agree"
              className="mt-1"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              Tôi xác nhận không nhập thông tin nhạy cảm nếu không cần thiết. Email
              sẽ gửi tới HR/C&amp;B ({HR_CONTACT_EMAIL}).
            </span>
          </label>

          {errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {errorMessage}
            </p>
          ) : null}

          <TurnstileWidget
            ref={turnstileRef}
            action="ask_hr"
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            className="flex justify-center"
          />

          {!canSubmit && submitState !== "sending" ? (
            <p className="text-center text-xs text-muted-foreground">
              Điền email, chọn chủ đề và mức khẩn, nhập câu hỏi (tối thiểu 5 ký tự),
              tick xác nhận{turnstileRequired ? " và hoàn thành xác minh Turnstile" : ""}{" "}
              để gửi.
            </p>
          ) : null}

          <Button
            type="submit"
            variant="cta"
            size="touch"
            className="w-full"
            disabled={!canSubmit || submitState === "sending"}
          >
            {submitState === "sending" ? "Đang gửi…" : "Gửi email cho HR"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Muốn kiểm tra lại trước khi gửi?{" "}
            <Link href="/search" className="font-medium text-accent underline-offset-4 hover:underline">
              Quay lại câu trả lời
            </Link>{" "}
            hoặc{" "}
            <Link href="/nguon-phap-luat" className="font-medium text-accent underline-offset-4 hover:underline">
              mở mục nguồn
            </Link>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
