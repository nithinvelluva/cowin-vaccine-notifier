import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  /* {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  }, */
  {
    path: '',
    redirectTo: 'cowinslot',
    pathMatch: 'full'
  },
  {
    path: 'result-section',
    loadChildren: () => import('./pages/results/result-section/result-section.module').then(m => m.ResultSectionPageModule)
  },
  {
    path: 'alert',
    loadChildren: () => import('./pages/tabs/alert/alert.module').then(m => m.AlertPageModule)
  },
  {
    path: 'hometab',
    loadChildren: () => import('./pages/tabs/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'cowinslot',
    loadChildren: () => import('./pages/cowinslot/cowinslot.module').then(m => m.CowinslotPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
