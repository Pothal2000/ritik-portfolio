import { Injectable } from '@angular/core';
import { cvProfile } from '../../data/cv-data';

type CvProfile = typeof cvProfile;

@Injectable({ providedIn: 'root' })
export class CvPdfService {
  private pdfModule?: Promise<typeof import('./cv-pdf')>;

  preload(): Promise<void> {
    return this.loadPdfModule().then(() => undefined);
  }

  async download(cv: CvProfile): Promise<void> {
    const { downloadCvPdf } = await this.loadPdfModule();
    downloadCvPdf(cv);
  }

  private loadPdfModule(): Promise<typeof import('./cv-pdf')> {
    this.pdfModule ??= import('./cv-pdf').catch((error: unknown) => {
      this.pdfModule = undefined;
      throw error;
    });
    return this.pdfModule;
  }
}
