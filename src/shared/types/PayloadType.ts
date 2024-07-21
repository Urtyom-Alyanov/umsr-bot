export interface PayloadType {
    command: string;
    gender?: 1 | 2;
    month?: number;
    nation?: string;
    republic?: string;
    city?: string;
    graf?: string;
    comment?: string;
    sId?: number;
    id?: string;
    status?: "accepted" | "declined" | "edit";
}