// Fetch BTC price
export async function getBTCPrice(): Promise<string> {
  const date = new Date();
  const response = await fetch(
    `https://api.coindesk.com/v1/bpi/historical/close.json?start=${date
      .toISOString()
      .slice(0, 10)}&end=${date.toISOString().slice(0, 10)}`,
  );
  const data = await response.json();
  return data.bpi[date.toISOString().slice(0, 10)];
}
// Fetch ETH price
export async function getETHPrice(): Promise<string> {
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&ts=${Date.now()}`,
  );
  const data = await response.json();
  return data.USD;
}
// Get prices

// test local
// Promise.all([getBTCPrice(), getETHPrice()]) .then(([btcPrice, ethPrice]) => { console.log(`Today's BTC price is ${btcPrice} USD and ETH price is ${ethPrice} USD`); });

export async function getZoomPrice(): Promise<string> {
  const regularMarketPrice = await fetch(
    'https://query1.finance.yahoo.com/v8/finance/chart/ZM',
  )
    .then((response) => response.json())
    .then((data) => {
      return data.chart.result[0].meta.regularMarketPrice;
    })
    .catch((error) => {
      console.error(error);
    });
  return regularMarketPrice;
}
