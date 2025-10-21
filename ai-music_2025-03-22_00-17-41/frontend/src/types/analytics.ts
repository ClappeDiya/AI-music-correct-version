export interface ListeningStats {
  totalHours: number;
  averageSessionMinutes: number;
  activeDays: number;
}

export interface GenrePreferences {
  topGenre: string;
  topGenrePercentage: number;
}

export interface TrendAnalysis {
  trend: string;
  changePercentage: number;
}

export interface AggregateData {
  totalHours: number;
  genrePreferences: GenrePreferences;
  trendAnalysis: TrendAnalysis;
}
