export interface RecommendedDocument {
  id: string;
  name: string;
  description: string;
  isUploaded: boolean;
  uploadedDocumentId?: number;
}

export interface GateRecommendations {
  gate: string;
  gateName: string;
  documents: RecommendedDocument[];
}

export interface RecommendationsWithProgress extends GateRecommendations {
  uploadedCount: number;
  totalCount: number;
  progressPercent: number;
}
