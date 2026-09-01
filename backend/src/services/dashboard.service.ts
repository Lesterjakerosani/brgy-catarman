import { prisma } from "../config/prisma";
import { startOfManilaDay, startOfManilaMonth, startOfManilaYear } from "../utils/manilaTime.util";

async function getStats() {
  const [
    totalResidents,
    activeResidents,
    registeredVoters,
    totalHouseholds,
    householdsByClassification,
    residentsByGender,
    certificatesByStatus,
    complaintsByStatus,
    blottersByStatus,
    pendingCertificates,
    openComplaints,
    activeBlotters,
    publishedAnnouncements,
    unreadNotifications,
  ] = await Promise.all([
    prisma.resident.count({ where: { deletedAt: null } }),
    prisma.resident.count({ where: { deletedAt: null, isActive: true } }),
    prisma.resident.count({ where: { deletedAt: null, isRegisteredVoter: true } }),
    prisma.household.count({ where: { deletedAt: null, isArchived: false } }),
    prisma.household.groupBy({
      by: ["classification"],
      where: { deletedAt: null, isArchived: false },
      _count: true,
    }),
    prisma.resident.groupBy({ by: ["gender"], where: { deletedAt: null }, _count: true }),
    prisma.certificateRequest.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    prisma.complaint.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    prisma.blotter.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
    prisma.certificateRequest.count({
      where: { deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
    }),
    prisma.complaint.count({ where: { deletedAt: null, status: { in: ["NEW", "UNDER_REVIEW"] } } }),
    prisma.blotter.count({
      where: { deletedAt: null, isArchived: false, status: { in: ["OPEN", "UNDER_MEDIATION"] } },
    }),
    prisma.announcement.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  const toCountMap = (rows: Array<{ _count: number } & Record<string, unknown>>, key: string) =>
    Object.fromEntries(rows.map((row) => [row[key], row._count]));

  return {
    residents: {
      total: totalResidents,
      active: activeResidents,
      registeredVoters,
      byGender: toCountMap(residentsByGender, "gender"),
    },
    households: {
      total: totalHouseholds,
      byClassification: toCountMap(householdsByClassification, "classification"),
    },
    certificates: {
      byStatus: toCountMap(certificatesByStatus, "status"),
      pending: pendingCertificates,
    },
    complaints: {
      byStatus: toCountMap(complaintsByStatus, "status"),
      open: openComplaints,
    },
    blotters: {
      byStatus: toCountMap(blottersByStatus, "status"),
      active: activeBlotters,
    },
    announcements: { published: publishedAnnouncements },
    notifications: { unread: unreadNotifications },
  };
}

async function getPublicStats() {
  const [residents, households, puroks, certificatesProcessed, incidentsResolved] = await Promise.all([
    prisma.resident.count({ where: { deletedAt: null } }),
    prisma.household.count({ where: { deletedAt: null, isArchived: false } }),
    prisma.purok.count(),
    prisma.certificateRequest.count({
      where: { deletedAt: null, status: { in: ["APPROVED", "READY_FOR_CLAIM", "CLAIMED"] } },
    }),
    prisma.complaint.count({ where: { deletedAt: null, status: "RESOLVED" } }),
  ]);

  return { residents, households, puroks, certificatesProcessed, incidentsResolved };
}

// Revenue is only recognized once a document has actually been claimed
// (feeAmount is a locked-in price snapshot set at approval time -- see
// certificateRequest.service.ts). Pending/processing/approved-but-unclaimed/
// rejected requests never count, per the barangay's revenue policy.
async function getRevenueAnalytics() {
  const now = new Date();
  const todayStart = startOfManilaDay(now);
  const monthStart = startOfManilaMonth(now);
  const yearStart = startOfManilaYear(now);
  const claimedWhere = { deletedAt: null, status: "CLAIMED" as const };

  const [totalsToday, totalsMonth, totalsYear, totalsAll, documentTypes, breakdownToday, breakdownMonth, breakdownYear, breakdownAll] =
    await Promise.all([
      prisma.certificateRequest.aggregate({ where: { ...claimedWhere, claimedAt: { gte: todayStart } }, _sum: { feeAmount: true } }),
      prisma.certificateRequest.aggregate({ where: { ...claimedWhere, claimedAt: { gte: monthStart } }, _sum: { feeAmount: true } }),
      prisma.certificateRequest.aggregate({ where: { ...claimedWhere, claimedAt: { gte: yearStart } }, _sum: { feeAmount: true } }),
      prisma.certificateRequest.aggregate({ where: claimedWhere, _sum: { feeAmount: true } }),
      prisma.documentType.findMany({ where: { deletedAt: null }, select: { id: true, name: true, fee: true } }),
      prisma.certificateRequest.groupBy({
        by: ["documentTypeId"],
        where: { ...claimedWhere, claimedAt: { gte: todayStart } },
        _sum: { feeAmount: true },
        _count: true,
      }),
      prisma.certificateRequest.groupBy({
        by: ["documentTypeId"],
        where: { ...claimedWhere, claimedAt: { gte: monthStart } },
        _sum: { feeAmount: true },
        _count: true,
      }),
      prisma.certificateRequest.groupBy({
        by: ["documentTypeId"],
        where: { ...claimedWhere, claimedAt: { gte: yearStart } },
        _sum: { feeAmount: true },
        _count: true,
      }),
      prisma.certificateRequest.groupBy({
        by: ["documentTypeId"],
        where: claimedWhere,
        _sum: { feeAmount: true },
        _count: true,
      }),
    ]);

  const documentTypeById = new Map(documentTypes.map((d) => [d.id, d]));
  const toBreakdown = (rows: typeof breakdownAll) =>
    rows
      .map((row) => {
        const docType = documentTypeById.get(row.documentTypeId);
        return {
          documentTypeId: row.documentTypeId,
          name: docType?.name ?? "Unknown",
          price: docType?.fee ?? 0,
          count: row._count,
          revenue: row._sum.feeAmount ?? 0,
        };
      })
      .sort((a, b) => Number(b.revenue) - Number(a.revenue));

  return {
    totals: {
      today: totalsToday._sum.feeAmount ?? 0,
      month: totalsMonth._sum.feeAmount ?? 0,
      year: totalsYear._sum.feeAmount ?? 0,
      allTime: totalsAll._sum.feeAmount ?? 0,
    },
    breakdown: {
      today: toBreakdown(breakdownToday),
      month: toBreakdown(breakdownMonth),
      year: toBreakdown(breakdownYear),
      allTime: toBreakdown(breakdownAll),
    },
  };
}

export const dashboardService = { getStats, getPublicStats, getRevenueAnalytics };
