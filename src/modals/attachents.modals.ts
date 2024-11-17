export enum ATTACHMENT_STATUS {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IAttachments {
  status: ATTACHMENT_STATUS;
  file: File;
  url?: string;
}
