export type UpdateStatus = 'GA' | 'Preview' | 'Deprecated' | 'Retired' | 'New';

export type DomainCategory = 
  | 'Compute'
  | 'Networking'
  | 'Storage'
  | 'Databases'
  | 'AI + Machine Learning'
  | 'Security'
  | 'Developer Tools'
  | 'Integration'
  | 'Analytics'
  | 'Containers'
  | 'Management'
  | 'Web'
  | 'IoT'
  | 'Mixed Reality';

export interface AzureUpdate {
  id: string;
  title: string;
  description: string;
  domain: DomainCategory[];
  status: UpdateStatus;
  date: string;
  link?: string;
}

export type ViewMode = 'grid' | 'timeline';
