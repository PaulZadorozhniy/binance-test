import WebSocket from 'ws';
import { BinanceApi } from './binance-api';

export class BinanceWs {
  private baseWsUrl: string;

  private ws!: WebSocket;
  private api: BinanceApi;
  private handlers: { [topic: string]: Function[] } = {};

  constructor(baseWsUrl: string, api: BinanceApi) {
    this.baseWsUrl = baseWsUrl;
    this.api = api;
  }

  public async createSocket(listeningkey: string): Promise<void> {
    console.log('creating listener for', listeningkey);

    setInterval(async () => {
      await this.api.keepAliveListeningKey(listeningkey);
      console.log('Updated listenKey', listeningkey);
    }, 1000 * 60 * 30);

    this.ws = new WebSocket(`${this.baseWsUrl}/${listeningkey.toLowerCase()}`);

    await this.registerSocketListeners(listeningkey);
  }

  public on(topic: string, handler: Function) {
    if (!this.handlers[topic]) {
      this.handlers[topic] = [];
    }
    this.handlers[topic].push(handler);
  }

  private async registerSocketListeners(listeningkey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.on('open', () => {
        console.log('connection opened for:', listeningkey);

        resolve();
      });

      this.ws.on('message', (data: string) => {
        const message = JSON.parse(data);

        if (this.handlers[message.e]) {
          this.handlers[message.e].forEach((handler: Function) =>
            handler(message)
          );
        }
      });

      this.ws.on('close', () => {
        console.log('socket closed ping');
      });

      this.ws.on('error', reject);
    });
  }
}
