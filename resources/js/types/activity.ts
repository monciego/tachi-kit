export type ActivityActor = {
    name: string;
    avatar: string | null;
};

export type ActivityEntry = {
    id: number;
    event: string;
    /** Ready-to-display sentence, e.g. "Deactivated user Jane Doe". */
    description: string;
    /** Null for anonymous entries such as failed logins for unknown emails. */
    causer: ActivityActor | null;
    created_at: string;
};

export type ActivityEventOption = {
    value: string;
    label: string;
};
