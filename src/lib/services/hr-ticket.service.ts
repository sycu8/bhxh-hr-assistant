import type { TicketPriority, TicketStatus } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import { writeCmsAuditLog } from "@/lib/cms/audit-log";
import { sendHrInquiryEmail } from "@/lib/email/send-hr-inquiry-email";
import type { AskHrSendInput } from "@/lib/validators/ask-hr.schema";

export type CreateTicketInput = AskHrSendInput & {
  searchQuery?: string;
  questionLogId?: string;
  createdById?: string;
};

function mapUrgentToPriority(urgent: AskHrSendInput["urgent"]): TicketPriority {
  return urgent === "urgent" ? "URGENT" : "NORMAL";
}

async function nextTicketNumber(): Promise<string> {
  const db = getDb();
  const year = new Date().getFullYear();
  const prefix = `HR-${year}-`;
  const latest = await db.hrTicket.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: "desc" },
    select: { ticketNumber: true },
  });
  const seq = latest
    ? Number.parseInt(latest.ticketNumber.slice(prefix.length), 10) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function createHrTicket(input: CreateTicketInput) {
  const db = getDb();
  const ticketNumber = await nextTicketNumber();
  const priority = mapUrgentToPriority(input.urgent);

  const slaDueAt = new Date(
    Date.now() +
      (priority === "URGENT" ? 1 : 3) * 24 * 60 * 60 * 1000,
  );

  const ticket = await db.hrTicket.create({
    data: {
      ticketNumber,
      question: input.question,
      detail: input.detail?.trim() || null,
      topic: input.topic,
      priority,
      replyEmail: input.replyEmail,
      searchQuery: input.searchQuery?.trim() || null,
      questionLogId: input.questionLogId ?? null,
      createdById: input.createdById ?? null,
      status: "OPEN",
      slaDueAt,
    },
  });

  let notifyEmailSent = false;
  try {
    await sendHrInquiryEmail({
      ...input,
      ticketNumber: ticket.ticketNumber,
    });
    notifyEmailSent = true;
    await db.hrTicket.update({
      where: { id: ticket.id },
      data: { notifyEmailSent: true },
    });
  } catch (error) {
    console.error("[hr-ticket] email notify failed", error);
  }

  await writeCmsAuditLog({
    action: "ticket.create",
    entityType: "HrTicket",
    entityId: ticket.id,
    metadata: {
      ticketNumber: ticket.ticketNumber,
      topic: ticket.topic,
      priority: ticket.priority,
      notifyEmailSent,
    },
  });

  return { ...ticket, notifyEmailSent };
}

export async function listHrTickets(params?: {
  status?: TicketStatus;
  take?: number;
}) {
  const db = getDb();
  return db.hrTicket.findMany({
    where: params?.status ? { status: params.status } : undefined,
    orderBy: { createdAt: "desc" },
    take: params?.take ?? 50,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateHrTicketStatus(params: {
  ticketId: string;
  status: TicketStatus;
  actorId?: string;
}) {
  const db = getDb();
  const updated = await db.hrTicket.update({
    where: { id: params.ticketId },
    data: {
      status: params.status,
      resolvedAt: params.status === "RESOLVED" || params.status === "CLOSED"
        ? new Date()
        : null,
    },
  });

  await writeCmsAuditLog({
    actorId: params.actorId,
    action: "ticket.status",
    entityType: "HrTicket",
    entityId: updated.id,
    metadata: { status: params.status, ticketNumber: updated.ticketNumber },
  });

  return updated;
}

export async function listHrTicketsForUser(userId: string) {
  const db = getDb();
  return db.hrTicket.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getHrTicketForUser(userId: string, ticketId: string) {
  const db = getDb();
  return db.hrTicket.findFirst({
    where: { id: ticketId, createdById: userId },
    include: {
      comments: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
