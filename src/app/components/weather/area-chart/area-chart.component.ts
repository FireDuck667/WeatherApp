import {AfterViewInit, Component, Input, ViewChild, ElementRef} from '@angular/core';
import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-moment';

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

@Component({
  selector: 'app-area-chart',
  templateUrl: './area-chart.component.html',
  styleUrls: ['./area-chart.component.scss']
})
export class AreaChartComponent implements AfterViewInit {
  @ViewChild('mychart') mychart!: ElementRef<HTMLCanvasElement>;

  @Input() data: ForecastTimeLineItem[] = [];

  ngAfterViewInit() {
    const canvas = this.mychart.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!Array.isArray(this.data)) {
      console.error('Data is not an array:', this.data);
      return;
    }

    const chartData = this.data.map(item => ({
      x: new Date(item.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      y: parseFloat(item.values.temperature.toFixed(0))
    }));

    const timeLabels = chartData
      .map(item => item.x)
      .filter((_, index) => index % 1 === 0);

    Chart.register(...registerables);

    const myChart = new Chart(ctx!, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{
          label: 'Temperature',
          backgroundColor: "rgba(255, 182, 193, 0.4)",
          borderColor: "rgb(255, 105, 180)",
          fill: true,
          data: chartData.map(item => item.y),
          pointRadius: 0,  // Hide points by default
          pointHoverRadius: 5  // Show points on hover with a radius of 5
        }]
      },

      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              labelTextColor: () => '#e5e7eb'
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              color: '#e5e7eb',
              autoSkip: true,
              maxRotation: 0,
              minRotation: 0
            }
          },
          y: {
            type: 'linear',
            ticks: {
              color: '#e5e7eb',
            }
          }
        }
      }
    });
  }
}
