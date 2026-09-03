import { DsFulfillSandboxProvider } from './dsfulfill-sandbox.provider';

// Central registry for all sourcing providers
export const sourcingProviderRegistry: Record<string, any> = {
  'dsfulfill_sandbox': new DsFulfillSandboxProvider(),
};

export * from './cost-calculator';
export * from './procurement.service';
export * from './catalog-sync.job';
