import { watchTradeWebsokets } from './tradeWebsokets';
import { watchNonZeroAccountBalances } from './watchBalances';

watchNonZeroAccountBalances();

watchTradeWebsokets();

process.on('unhandledRejection', (reason, p) => {
  console.log(
    'Possibly Unhandled Rejection at: Promise ',
    p,
    ' reason: ',
    reason
  );
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION ');
  console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
});
