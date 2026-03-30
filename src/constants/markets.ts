import { MarketOption } from '../types/fuel';

export const MARKETS: MarketOption[] = [
  { id: 'NUS', label: 'U.S.', subtitle: 'National benchmark' },
  { id: 'R10', label: 'East Coast', subtitle: 'PADD 1' },
  { id: 'R20', label: 'Midwest', subtitle: 'PADD 2' },
  { id: 'R30', label: 'Gulf Coast', subtitle: 'PADD 3' },
  { id: 'R40', label: 'Rocky Mountain', subtitle: 'PADD 4' },
  { id: 'R50', label: 'West Coast', subtitle: 'PADD 5' },
  { id: 'SCA', label: 'California', subtitle: 'State benchmark' }
];
