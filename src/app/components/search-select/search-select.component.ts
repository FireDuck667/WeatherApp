import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {CITIES_SELECT_OPTIONS} from "../../consts";
import {CitySelectOptions, Coordinates, SupportedLanguage} from "../../models/weather.model";
import {TranslocoService} from "@ngneat/transloco";
import {Subject, takeUntil, debounceTime, distinctUntilChanged} from 'rxjs';

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchSelectComponent implements OnInit, OnDestroy {
  searchTerm = '';
  selectedOption: CitySelectOptions | null = null;
  highlightedIndex = -1;
  readonly options = CITIES_SELECT_OPTIONS;
  isFocused = false;
  currentLanguage: SupportedLanguage = 'en';

  @Output() optionSelected = new EventEmitter<Coordinates>();

  private readonly destroy$ = new Subject<void>();
  private readonly searchTerms$ = new Subject<string>();

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initializeLanguage();
    this.setupSearchObservable();
  }

  get filteredOptions(): CitySelectOptions[] {
    if (this.selectedOption) {
      return [];
    }
    return this.options.filter(option =>
      this.currentLanguage in option.label &&
      option.label[this.currentLanguage].toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  handleInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerms$.next(inputElement.value);
  }

  handleOptionSelect(option: CitySelectOptions): void {
    this.selectedOption = option;
    this.searchTerm = option.label[this.currentLanguage];
    this.highlightedIndex = -1;
    this.isFocused = false;
    this.optionSelected.emit(option.coordinates);
    this.cdr.markForCheck();
  }

  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowUp':
        this.updateHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        this.updateHighlightedIndex(1);
        break;
      case 'Enter':
        if (this.highlightedIndex !== -1) {
          this.handleOptionSelect(this.filteredOptions[this.highlightedIndex]);
        }
        break;
    }
  }

  clearSelection(): void {
    this.selectedOption = null;
    this.searchTerm = '';
    this.cdr.markForCheck();
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    setTimeout(() => {
      this.isFocused = false;
      this.cdr.markForCheck();
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeLanguage(): void {
    this.currentLanguage = this.translocoService.getActiveLang() as SupportedLanguage;

    this.translocoService.langChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        if (this.isSupportedLanguage(lang)) {
          this.currentLanguage = lang;
          this.cdr.markForCheck();
        }
      });
  }

  private setupSearchObservable(): void {
    this.searchTerms$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.searchTerm = term;
        this.selectedOption = null;
        this.highlightedIndex = -1;
        this.cdr.markForCheck();
      });
  }

  private updateHighlightedIndex(direction: number): void {
    const length = this.filteredOptions.length;
    this.highlightedIndex = (this.highlightedIndex + direction + length) % length;
    this.cdr.markForCheck();
  }

  private isSupportedLanguage(lang: string): lang is SupportedLanguage {
    return lang === 'en' || lang === 'pt';
  }
}
