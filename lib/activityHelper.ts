export interface ActivityStatus {
  label: string;
  color: "emerald" | "amber" | "rose" | "slate";
  isWarning: boolean;
  daysAgo: number;
}

export function getCreatorActivityStatus(lastActiveDateString?: string | null): ActivityStatus {
  if (!lastActiveDateString) {
    return {
      label: "Status keaktifan belum tercatat",
      color: "slate",
      isWarning: false,
      daysAgo: 999,
    };
  }

  const lastActive = new Date(lastActiveDateString).getTime();
  const now = new Date().getTime();
  const diffInHours = Math.floor((now - lastActive) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  // 1. Kurang dari 24 jam
  if (diffInHours < 24) {
    return {
      label: diffInHours <= 1 ? "Online baru saja" : `Aktif ${diffInHours} jam lalu`,
      color: "emerald",
      isWarning: false,
      daysAgo: 0,
    };
  }

  // 2. Dalam 7 hari
  if (diffInDays < 7) {
    return {
      label: `Aktif ${diffInDays} hari yang lalu`,
      color: "emerald",
      isWarning: false,
      daysAgo: diffInDays,
    };
  }

  // 3. Dalam 30 hari (1 bulan)
  if (diffInDays <= 30) {
    return {
      label: `Aktif ${Math.floor(diffInDays / 7)} minggu lalu`,
      color: "amber",
      isWarning: false,
      daysAgo: diffInDays,
    };
  }

  // 4. Lebih dari 90 hari (3 bulan tidak aktif) -> PERINGATAN
  if (diffInDays > 90) {
    return {
      label: "Perhatian: Kreator tidak aktif > 3 bulan",
      color: "rose",
      isWarning: true,
      daysAgo: diffInDays,
    };
  }

  // Antara 1 - 3 bulan
  return {
    label: `Aktif ${Math.floor(diffInDays / 30)} bulan lalu`,
    color: "amber",
    isWarning: false,
    daysAgo: diffInDays,
  };
}