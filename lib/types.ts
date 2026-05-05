export interface PersonNode {
  id: string;
  user_id: string;
  name: string;
  role?: string;
  company?: string;
  type: string;
  tags: string[];
  notes?: string;
  met_at?: string;
  last_contacted?: string;
  pos_x: number;
  pos_y: number;
  color?: string;
}

export interface RelationshipEdge {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  label?: string;
}
