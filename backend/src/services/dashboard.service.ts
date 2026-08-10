import { prisma } from "../config/prisma";

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
      where: { deletedAt: null, status: { in: ["PENDING", "UNDER_REVIEW"] } },
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

export const dashboardService = { getStats, getPublicStats };
