import { searchCoupangProducts } from './src/infrastructure/clients/coupang';
async function main() {
  const result20 = await searchCoupangProducts('사무실 의자', 20);
  console.log('limit 20 items:', result20.length);
  const result30 = await searchCoupangProducts('사무실 의자', 30);
  console.log('limit 30 items:', result30.length);
}
main();
