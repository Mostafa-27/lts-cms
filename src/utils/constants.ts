// export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const MOCK_WORKER_ENABLED = true;
export const TOKEN_COOKIE_KEY = "rdq_token";
export const USER_COOKIE_KEY = "rdq_user";
export const DATE_FORMAT_PATTERN = "dd-MM-yyyy";

export const FEES_CALCULATOR = [
  { id: "1", name: "Round 1 hour" },
  { id: "2", name: "Exact" },
  { id: "3", name: "Subscription" },
];

export const DISPENSER_TYPES = [
  { id: "1", name: "Exit Dispenser" },
  { id: "2", name: "Entry Dispenser" },
];

export const CARD_TYPES = [
  { id: "1", name: "Manager Card" },
  { id: "2", name: "Plan Card" },
];

export const WEEK_DAYS = [
  { id: "1", name: "Saturday" },
  { id: "2", name: "Sunday" },
  { id: "3", name: "Monday" },
  { id: "4", name: "Tuesday" },
  { id: "5", name: "Wednesday" },
  { id: "6", name: "Thursday" },
  { id: "7", name: "Friday" },
];

export const ROLES = [
  { id: "1", name: "Super Admin" },
  { id: "2", name: "Admin" },
  { id: "3", name: "Supervisor" },
  { id: "4", name: "Operator" },
];

export const PARKING_TYPES = [
  { id: "1", name: "Per Hour" },
  { id: "2", name: "Per Entry" },
];

export const PLAN_TYPES = [
  { id: "1", name: "Ticket" },
  { id: "2", name: "Card" },
  { id: "3", name: "Tag" },
];

export const VEHICLE_TYPES = [
  { id: "1", name: "Sedan" },
  { id: "2", name: "Bus" },
  { id: "3", name: "Van" },
];
