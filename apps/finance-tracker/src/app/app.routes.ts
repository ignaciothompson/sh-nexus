import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SpendingComponent } from './components/spending/spending.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { InvestmentsComponent } from './components/investments/investments.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'spending', component: SpendingComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'investments', component: InvestmentsComponent }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
