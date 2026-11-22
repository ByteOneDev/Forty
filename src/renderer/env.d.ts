/// <reference types="vite/client" />
import type { FortyApi } from '@shared/types';

declare global {
  interface Window { forty: FortyApi }
}
