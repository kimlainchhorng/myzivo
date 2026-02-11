const STORAGE_KEY = "zivo_scheduled_bookings";

export type ScheduledBookingType = "ride" | "eats" | "delivery";
export type ScheduledBookingStatus = "scheduled" | "completed" | "cancelled";

export interface ScheduledBooking {
  id: string;
  type: ScheduledBookingType;
  scheduledDate: string; // ISO date
  scheduledTime: string; // "HH:mm"
  pickup: string;
  destination: string;
  status: ScheduledBookingStatus;
  details: Record<string, any>;
  createdAt: number;
}

function readBookings(): ScheduledBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScheduledBooking[]) : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings: ScheduledBooking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function useScheduledBookings() {
  const getScheduledBookings = (): ScheduledBooking[] => readBookings();

  const addScheduledBooking = (
    data: Omit<ScheduledBooking, "id" | "status" | "createdAt">
  ): ScheduledBooking => {
    const booking: ScheduledBooking = {
      ...data,
      id: crypto.randomUUID(),
      status: "scheduled",
      createdAt: Date.now(),
    };
    const all = readBookings();
    all.push(booking);
    writeBookings(all);
    return booking;
  };

  const cancelScheduledBooking = (id: string) => {
    const all = readBookings().map((b) =>
      b.id === id ? { ...b, status: "cancelled" as const } : b
    );
    writeBookings(all);
  };

  const editScheduledBooking = (
    id: string,
    updates: Partial<Pick<ScheduledBooking, "scheduledDate" | "scheduledTime" | "pickup" | "destination" | "details">>
  ) => {
    const all = readBookings().map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    writeBookings(all);
  };

  const getUpcoming = (): ScheduledBooking[] => {
    const now = new Date();
    return readBookings()
      .filter((b) => {
        if (b.status !== "scheduled") return false;
        const bookingDate = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
        return bookingDate > now;
      })
      .sort((a, b) => {
        const da = new Date(`${a.scheduledDate}T${a.scheduledTime}`).getTime();
        const db = new Date(`${b.scheduledDate}T${b.scheduledTime}`).getTime();
        return da - db;
      });
  };

  return {
    getScheduledBookings,
    addScheduledBooking,
    cancelScheduledBooking,
    editScheduledBooking,
    getUpcoming,
  };
}
