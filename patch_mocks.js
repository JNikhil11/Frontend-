const fs = require('fs');

let content = fs.readFileSync('src/api/mocks.ts', 'utf8');

// We need to generate 46 items for MOCK_MODULE_B.lvm3.series
const fakeSeries = [];
for (let i = 1; i <= 46; i++) {
  const part_id = 'PART_' + i.toString().padStart(3, '0');
  const exceeds = i === 10 || i === 25; // fake some exceeders
  const v0 = 10 + Math.random() * 5;
  const v24 = v0 + (exceeds ? 10 + Math.random() * 5 : 1 + Math.random() * 3);
  const p168 = v24 + (v24 - v0) * 6; // linear projection approx
  fakeSeries.push({
    part_id,
    value_0h: parseFloat(v0.toFixed(2)),
    value_24h: parseFloat(v24.toFixed(2)),
    predicted_168h: parseFloat(p168.toFixed(2)),
    exceeds_slope: exceeds
  });
}

const newSeriesStr = JSON.stringify(fakeSeries, null, 8).replace(/\]$/, '      ]');

const regex = /export const MOCK_MODULE_B: Record<string, ModuleBData> = \{\s*lvm3: \{\s*safety_slope_limit_uA: 55\.0,\s*series: \[[\s\S]*?\],\s*\},\s*pslv:/;

const replacement = \export const MOCK_MODULE_B: Record<string, ModuleBData> = {
  lvm3: {
    safety_slope_limit_uA: 55.0,
    series: \,
  },
  pslv:\;

content = content.replace(regex, replacement);
fs.writeFileSync('src/api/mocks.ts', content);
console.log('Done replacing MOCK_MODULE_B lvm3 series.');
