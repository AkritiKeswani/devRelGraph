export interface PersonNode {
  id: string;
  user_id: string;
  name: string;
  linkedin_url?: string;
  company?: string;
  person?: string;
  activity?: string;
  notes?: string;
  company_url?: string;
  role?: string;
  twitter_url?: string;
  last_interacted?: string;
  type?: string;
  tags?: string[];
  met_at?: string;
  last_contacted?: string;
  pos_x: number;
  pos_y: number;
  color?: string;
  width?: number;
  height?: number;
}

export interface RelationshipEdge {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  label?: string;
}
