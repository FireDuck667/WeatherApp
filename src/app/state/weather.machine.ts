import {Injectable} from '@angular/core';
import {assign, createMachine, EventObject, interpret, MachineOptions, State} from 'xstate';
import {firstValueFrom, fromEventPattern} from 'rxjs';
import {map} from 'rxjs/operators';
import {WeatherService} from '../services/weather.service';
import {Coordinates, IFetchForecastResponseWithLocation} from '../models/weather.model';

export interface WeatherMachineContext {
  data?: IFetchForecastResponseWithLocation;
  error?: string;
  coordinates?: Coordinates;
}

type Fetch = { type: 'FETCH' };
type Refetch = { type: 'REFETCH'; coordinates: Coordinates };
type FetchSuccess = { type: 'done.invoke.fetchData'; data: IFetchForecastResponseWithLocation };
type FetchError = { type: 'error.platform.fetchData'; data: { message: string } };

type WeatherEvent = Fetch | Refetch | FetchSuccess | FetchError;

function isFetchSuccess(event: WeatherEvent): event is FetchSuccess {
  return event.type.startsWith('done.invoke') && 'data' in event;
}

function isFetchError(event: WeatherEvent): event is FetchError {
  return event.type.startsWith('error.platform') && 'data' in event;
}

function isRefetch(event: WeatherEvent): event is Refetch {
  return event.type === 'REFETCH';
}

@Injectable({ providedIn: 'root' })
export class WeatherMachine {
  weatherMachineOptions: MachineOptions<WeatherMachineContext, WeatherEvent> = {
    services: {
      fetchData: (context) =>
        firstValueFrom(this.weatherService.getForecast(context.coordinates)),
    },
    actions: {
      assignDataToContext: assign<WeatherMachineContext, WeatherEvent>((context, event) => {
        if (isFetchSuccess(event)) {
          console.log(event.data);
          return {
            data: event.data,
          };
        }
        return context;
      }),
      assignErrorToContext: assign<WeatherMachineContext, WeatherEvent>((context, event) => {
        if (isFetchError(event)) {
          return {
            error: event.data?.message || 'An error occurred',
          };
        }
        return context;
      }),
      setLocation: assign<WeatherMachineContext, WeatherEvent>((context, event) => {
        if (isRefetch(event)) {
          return {
            coordinates: event.coordinates,
          };
        }
        return context;
      }) as any,
    },
  };

  private _weatherMachine = createMachine<WeatherMachineContext, WeatherEvent>(
    {
      id: 'weather',
      initial: 'idle',
      context: {
        data: undefined,
        error: undefined,
      },
      states: {
        idle: {
          on: {
            FETCH: { target: 'fetching' },
            REFETCH: {
              target: 'fetching',
              actions: 'setLocation',
            },
          },
        },
        fetching: {
          invoke: {
            src: 'fetchData',
            onDone: {
              target: 'idle',
              actions: 'assignDataToContext',
            },
            onError: {
              target: 'idle',
              actions: 'assignErrorToContext',
            },
          },
        },
      },
    },
    this.weatherMachineOptions
  );

  private service = interpret(this._weatherMachine).start();

  weatherState$ = fromEventPattern<[State<WeatherMachineContext, WeatherEvent>, EventObject]>(
    (handler) => this.service.onTransition(handler),
    (_, service) => service.stop()
  ).pipe(map(([state, _]) => state));

  send(event: Extract<WeatherEvent, { type: 'FETCH' | 'REFETCH' }>) {
    this.service.send(event);
  }

  constructor(private weatherService: WeatherService) {}
}
