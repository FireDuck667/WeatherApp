export interface ForecastTimeLineItem {
  time: string;
  values: {
    cloudBase: number;
    cloudCeiling: number;
    cloudCover: number;
    dewPoint: number;
    freezingRainIntensity: number;
    humidity: number;
    precipitationProbability: number;
    pressureSurfaceLevel: number;
    rainIntensity: number;
    sleetIntensity: number;
    snowIntensity: number;
    temperature: number;
    temperatureAvg: number;
    temperatureApparent: number;
    uvHealthConcern: number;
    uvIndex: number;
    visibility: number;
    weatherCode: number;
    windDirection: number;
    windGust: number;
    windSpeed: number;
  };
}

export interface ForecastTimelines {
  daily: ForecastTimeLineItem[],
  hourly: ForecastTimeLineItem[],
  minutely: ForecastTimeLineItem[],
}

export interface FetchForecastResponse {
  timelines: ForecastTimelines,
}

export interface IFetchForecastResponseWithLocation {
  forecast: FetchForecastResponse;
  cityName: string;
}


export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CitySelectOptions {
  id: number,
  label: {
    en: string;
    pt: string;
  },
  coordinates: Coordinates
}


export type SupportedLanguage = 'en' | 'pt';
