export interface Channel {
  id: string;
  name: string;
  workspace: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateChannelInput {
  name: string;
}
