import { DsFulfillSandboxProvider } from './dsfulfill-sandbox.provider';
import { CJDropshippingSandboxProvider } from './cj-dropshipping-sandbox.provider';
import { CJDropshippingProvider } from './cj-dropshipping.provider';

// Central registry for all sourcing providers
export const sourcingProviderRegistry: Record<string, any> = {
  'dsfulfill_sandbox': new DsFulfillSandboxProvider(),
  'cj_dropshipping_sandbox': new CJDropshippingSandboxProvider(),
  'cj_dropshipping': new CJDropshippingProvider(),
};

// Mitao currently uses CJDropshipping as the active provider
export const activeProvider = sourcingProviderRegistry['cj_dropshipping'];

export * from './sourcing-provider.interface';
export * from './dsfulfill-sandbox.provider';
export * from './cj-dropshipping-sandbox.provider';
export * from './cj-dropshipping.provider';
export * from './cost-calculator';
export * from './procurement.service';
export * from './catalog-sync.job';
