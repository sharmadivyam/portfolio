// Shared by the contact form and the route that emails it.
export const TOPICS = ["Hiring or an opportunity", "Book a call", "A project or collaboration", "Something else"] as const;
export type Topic = (typeof TOPICS)[number];
export const CALL_MINUTES = [15, 30, 45, 60] as const;
