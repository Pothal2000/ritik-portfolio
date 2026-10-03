import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/portfolio-page/portfolio-page').then((page) => page.PortfolioPage),
  },
  {
    path: 'resume',
    title: 'Ritik Pothal | CV',
    loadComponent: () => import('./pages/cv-page/cv-page').then((page) => page.CvPage),
  },
  { path: '**', redirectTo: '' },
];
