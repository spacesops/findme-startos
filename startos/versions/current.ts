import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:0',
  releaseNotes: {
    en_US:
      'Initial release for StartOS. Look up Spaces handles through the certrelay mesh; installing Spaces adds on-chain data automatically.',
    es_ES:
      'Lanzamiento inicial para StartOS. Consulta identificadores de Spaces a través de la red de certrelays; al instalar Spaces se añaden automáticamente los datos en cadena.',
    de_DE:
      'Erstveröffentlichung für StartOS. Spaces-Handles über das Certrelay-Netz nachschlagen; mit installiertem Spaces kommen On-Chain-Daten automatisch hinzu.',
    pl_PL:
      'Pierwsze wydanie dla StartOS. Wyszukuj identyfikatory Spaces przez sieć certrelay; instalacja Spaces automatycznie dodaje dane z łańcucha.',
    fr_FR:
      'Version initiale pour StartOS. Recherchez des identifiants Spaces via le réseau de certrelays ; installer Spaces ajoute automatiquement les données on-chain.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
