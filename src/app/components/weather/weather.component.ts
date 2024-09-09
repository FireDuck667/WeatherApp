import { Component, OnDestroy, OnInit } from '@angular/core';
import { WeatherMachine } from '../../state/weather.machine';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import {TranslocoService} from "@ngneat/transloco";
import {WeatherService} from "../../services/weather.service";
import {Coordinates} from "../../models/weather.model";

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit, OnDestroy {
  state: any;
  private subscription: Subscription | null = null;

  constructor(private weatherMachine: WeatherMachine, private translocoService: TranslocoService, private weatherService: WeatherService) {}

  ngOnInit() {
    this.subscription = this.weatherMachine.weatherState$.subscribe((state) => {
      this.state = state;
    });

    this.fetchWeather();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  fetchWeather() {
    this.weatherMachine.send({ type: 'FETCH' });
  }

  reFetchWeather(coordinates: Coordinates) {
    this.weatherMachine.send({ type: 'REFETCH', coordinates });
  }

  handleOptionSelected(location: Coordinates) {
    this.reFetchWeather(location);
  }

  getDayLabel(dateString: string): string {
    const currentLang = this.translocoService.getActiveLang();
    moment.locale(currentLang);

    const day = moment(dateString).startOf('day');
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');

    if (day.isSame(today)) {
      return this.translocoService.translate('COMMON.TODAY');
    } else if (day.isSame(tomorrow)) {
      return this.translocoService.translate('COMMON.TOMORROW');
    } else {
      return day.format('dddd');
    }
  }

  getWeatherIcon(weatherCode: number) {
    let iconSrc = '';
    switch (true) {
      case [1000, 1100].includes(weatherCode):
        iconSrc = 'assets/icons/sunny.svg';
        break;
      case [4000, 4200, 4001, 4201].includes(weatherCode):
        iconSrc = 'assets/icons/rainy.svg';
        break;
      case [1101, 1102, 1001].includes(weatherCode):
        iconSrc = 'assets/icons/cloudy.svg';
        break;
      default:
        iconSrc = 'assets/icons/sunny.svg';
    }
    return iconSrc;
  }

  getWeatherCodeString(weatherCode: number) {
    let translationKey = '';
    switch (true) {
      case [1000, 1100].includes(weatherCode):
        translationKey = 'WEATHER.SUNNY';
        break;
      case [4000, 4200, 4001, 4201].includes(weatherCode):
        translationKey = 'WEATHER.RAINY';
        break;
      case [1101, 1102, 1001].includes(weatherCode):
        translationKey = 'WEATHER.CLOUDY';
        break;
      default:
        translationKey = 'WEATHER.SUNNY';
    }
    return this.translocoService.translate(translationKey);
  }
}
