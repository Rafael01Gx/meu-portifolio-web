export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  repoUrl: string;
  liveUrl?: string;
  highlight?: boolean;
}
