import {Component} from '@angular/core';
import {TranslocoService} from '@ngneat/transloco';

@Component({
  selector: 'app-language-selector',
  templateUrl: 'language-selector.component.html',
  styleUrls: ['language-selector.component.scss'],
})
export class LanguageSelectorComponent {
  constructor(private translocoService: TranslocoService) {}

  get selectedLanguage(): string {
    return this.translocoService.getActiveLang();
  }

  public changeLanguage(languageCode: string): void {
    this.translocoService.setActiveLang(languageCode);
  }

  getButtonClass(languageCode: string): string {
    const baseClass = 'px-4 py-2 rounded-md';
    return this.selectedLanguage === languageCode
      ? `${baseClass} bg-transparent text-white border border-gray-300` :
      `${baseClass} bg-primary text-white  text-opacity-50`
  }
}
