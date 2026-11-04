import { useSyncExternalStore } from 'react'
import { estado, ouvir } from './store.js'

/** lê um pedaço do estado compartilhado e re-renderiza quando ele muda */
export function useEstado(seletor) {
  return useSyncExternalStore(ouvir, () => seletor(estado))
}
