import { describe, expect, it } from 'vitest';
import {
  getFormFactorProfile,
  getInterfaceTypeRule,
  searchHardwareReference,
} from '../../data/hardwareReference';

describe('hardwareReference', () => {
  it('models 100G-2 on QSFP-DD as four 100G breakout ports with adjacent-port impact', () => {
    const rule = getInterfaceTypeRule('100G-2', 'QSFP-DD');

    expect(rule?.breakoutResult).toBe('4 breakout ports at 100G');
    expect(rule?.consumedChannels).toBe(8);
    expect(rule?.disabledPortImpact).toContain('Adjacent even port disabled');
  });

  it('models 100G-4 on QSFP28 as one 100G port without adjacent-port disablement', () => {
    const rule = getInterfaceTypeRule('100G-4', 'QSFP28');

    expect(rule?.breakoutResult).toBe('1 port at 100G');
    expect(rule?.consumedChannels).toBe(4);
    expect(rule?.disabledPortImpact).toContain('No adjacent-port disablement');
  });

  it('models QSFP-DD as an 8-channel form factor', () => {
    const profile = getFormFactorProfile('QSFP-DD');

    expect(profile?.electricalLanes).toBe(8);
  });

  it('finds RA-1G optics by SKU and by concept phrase', () => {
    expect(searchHardwareReference('SFP-10G-RA-1G-SX')).toHaveLength(1);
    expect(searchHardwareReference('1G in 10G interface').map((item) => 'sku' in item ? item.sku : '')).toContain('SFP-10G-RA-1G-SX');
  });
});
