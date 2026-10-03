import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { cvProfile } from '../../data/cv-data';
import { CvPdfService } from './cv-pdf.service';

@Component({
  selector: 'app-cv-page',
  imports: [RouterLink],
  templateUrl: './cv-page.html',
  styleUrl: './cv-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvPage {
  protected readonly cv = cvProfile;
  protected readonly isDownloading = signal(false);
  protected readonly downloadError = signal('');

  private readonly cvPdfService = inject(CvPdfService);

  constructor() {
    void this.preparePdf();
  }

  protected async preparePdf(): Promise<void> {
    try {
      await this.cvPdfService.preload();
    } catch {
      this.downloadError.set('PDF preparation failed. Try downloading again.');
    }
  }

  protected async downloadCv(): Promise<void> {
    this.isDownloading.set(true);
    this.downloadError.set('');
    try {
      await this.cvPdfService.download(this.cv);
    } catch {
      this.downloadError.set('The PDF could not be downloaded. Please try again.');
    } finally {
      this.isDownloading.set(false);
    }
  }
}
