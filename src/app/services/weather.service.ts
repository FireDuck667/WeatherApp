import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Coordinates, FetchForecastResponse} from '../models/weather.model';
import {environment} from '../../environments/environment';
import {Observable, of} from 'rxjs';
import {switchMap, catchError, map} from 'rxjs/operators';
import {TranslocoService} from '@ngneat/transloco';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiUrl = environment.tomorrowIO.baseUrl;
  private apiKey = environment.tomorrowIO.apiKey;
  private defaultLocation = 'Mitzpe Ramon Israel';

  constructor(private http: HttpClient, private translocoService: TranslocoService) {
  }

  private getBrowserCoordinates(): Observable<Coordinates> {
    return new Observable((observer) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            observer.complete();
          },
          (error) => {
            observer.error(error);
          }
        );
      } else {
        observer.error(new Error('Geolocation not supported'));
      }
    });
  }

  private getCityNameFromCoordinates(lat: number, lng: number): Observable<string> {
    const currentLanguage = this.translocoService.getActiveLang();
    const geocodingUrl = `${environment.reversGeocode.baseUrl}reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${currentLanguage}`;
    return this.http.get<{ city?: string; locality?: string }>(geocodingUrl).pipe(
      map((response) => response.city || response.locality || 'Unknown location'),
      catchError(() => of('Unknown location'))
    );
  }

  private buildForecastUrl(lat: number, lng: number): string {
    const location = `${lat},${lng}`
    return `${this.apiUrl}v4/weather/forecast?location=${location}&apikey=${this.apiKey}`;
  }

  private fetchForecast(url: string): Observable<FetchForecastResponse> {
    return this.http.get<FetchForecastResponse>(url).pipe(
      catchError(() => of({} as FetchForecastResponse))
    );
  }

  getForecast(coordinates?: Coordinates): Observable<{ forecast: FetchForecastResponse; cityName: string }> {
    const getForecastWithCoordinates = (lat: number, lng: number): Observable<{
      forecast: FetchForecastResponse;
      cityName: string
    }> => {
      const forecastUrl = this.buildForecastUrl(lat, lng);
      console.log(forecastUrl);
      return this.getCityNameFromCoordinates(lat, lng).pipe(
        switchMap((cityName) =>
          this.fetchForecast(forecastUrl).pipe(
            map((forecast) => {
              console.log(forecast);
              return {forecast, cityName}
            })
          )
        ),
        catchError(() => of({forecast: {} as FetchForecastResponse, cityName: 'Unknown location'}))
      );
    };

    if (coordinates) {
      return getForecastWithCoordinates(coordinates.lat, coordinates.lng);
    } else {
      return this.getBrowserCoordinates().pipe(
        switchMap(({lat, lng}) => getForecastWithCoordinates(lat, lng)),
        catchError(() => of({forecast: {} as FetchForecastResponse, cityName: 'Unknown location'}))
      );
    }
  }
}
