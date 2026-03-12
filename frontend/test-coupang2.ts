import { searchCoupangProducts } from './src/infrastructure/clients/coupang';

async function main() {
  try {
    const r100 = await searchCoupangProducts('사무실 의자', 100);
    console.log('100:', r100.length);
  } catch(e) {}
  try {
    const r50 = await searchCoupangProducts('사무실 의자', 50);
    console.log('50:', r50.length);
  } catch(e) {}
  try {
    const r30 = await searchCoupangProducts('사무실 의자', 30);
    console.log('30:', r30.length);
  } catch(e) {}
  try {
    const r20 = await searchCoupangProducts('사무실 의자', 20);
    console.log('20:', r20.length);
  } catch(e) {}
}
main();
