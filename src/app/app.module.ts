import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';
import {AppComponent} from './app.component';
import {WeatherComponent} from './components/weather/weather.component';
import {DailyForecastComponent} from './components/weather/daily-forecast/daily-forecast.component';
import {AreaChartComponent} from './components/weather/area-chart/area-chart.component';
import {WeatherService} from './services/weather.service';
import {WeatherMachine} from './state/weather.machine';
import {Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip} from 'chart.js';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { ErrorComponent } from './components/error/error.component';
import {SearchSelectComponent} from "./components/search-select/search-select.component";
import {TranslocoPipe} from "@ngneat/transloco";
import {TranslocoRootModule} from "./transloco.loader";
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

Chart.register(LineController, LinearScale, Title, Tooltip, Legend, LineElement, PointElement, Filler);

@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent,
    DailyForecastComponent,
    AreaChartComponent,
    SkeletonComponent,
    ErrorComponent,
    SearchSelectComponent,
    LanguageSelectorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgOptimizedImage,
    FormsModule,
    TranslocoRootModule
  ],
  providers: [WeatherService, WeatherMachine],
  bootstrap: [AppComponent]
})
export class AppModule { }
