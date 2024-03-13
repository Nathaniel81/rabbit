export type Creator = {
    id: string;
}

export type Subrabbit = {
    id: number;
    name: string;
    created_at: string;
    members_count: string;
    creator: Creator;
    isSubscriber: string;
};