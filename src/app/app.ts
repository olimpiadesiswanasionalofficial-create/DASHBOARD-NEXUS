import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from './services/auth-state';
import { NotificationState } from './services/notification-service';
import { NexusBridge } from './services/nexus-bridge';
import { ProductState } from './services/product-state';

// UI Components
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { ProdukView } from './components/produk-view';
import { AuthView } from './components/auth-view';
import { AnalyticsView } from './components/analytics-view';
import { E2eVaultView } from './components/e2e-vault-view';
import { ApiIntegrationsView } from './components/api-integrations-view';
import { SocialModal } from './components/social-modal';
import { ForgotPasswordModal } from './components/forgot-password-modal';
import { TwoFactorModal } from './components/two-factor-modal';
import { NexusBridgeModal } from './components/nexus-bridge-modal';
import { PrintReportModal } from './components/print-report-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    MatIconModule,
    Header,
    Sidebar,
    ProdukView,
    AuthView,
    AnalyticsView,
    E2eVaultView,
    ApiIntegrationsView,
    SocialModal,
    ForgotPasswordModal,
    TwoFactorModal,
    NexusBridgeModal,
    PrintReportModal,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly auth = inject(AuthState);
  readonly notification = inject(NotificationState);
  readonly nexus = inject(NexusBridge);
  readonly productState = inject(ProductState);

  readonly currentTab = signal<'produk' | 'analytics' | 'vault' | 'api' | 'auth'>('produk');

  setTab(tab: 'produk' | 'analytics' | 'vault' | 'api' | 'auth') {
    this.currentTab.set(tab);
  }
}
