import { events } from "@/mock-data/events";

export function getEvents() {
  return events;
}

export function getRecentEvents() {
  return events.slice(0, 5);
}

export function getEventById(eventId) {
  return events.find((event) => event.id === eventId) || null;
}

export function queryEvents({ search = "", type = "All", status = "All", page = 1, pageSize = 5 } = {}) {
  const searchValue = search.trim().toLowerCase();
  const filtered = events.filter((event) => {
    const matchesSearch =
      !searchValue ||
      event.name.toLowerCase().includes(searchValue) ||
      event.location.toLowerCase().includes(searchValue) ||
      event.cause.toLowerCase().includes(searchValue);
    const matchesType = type === "All" || event.type === type;
    const matchesStatus = status === "All" || event.status === status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  };
}
