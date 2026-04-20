// src/lib/heroPhrase.js

/**
 * Frasi greeting contestuali per la Home hero title.
 * Logica deterministica client-side — nessuna AI call.
 *
 * Input: stato giornata corrente dell'utente.
 * Output: stringa italiana breve, senza "Ciao {nome}." (viene aggiunto dal chiamante).
 */

/**
 * @param {object} ctx
 * @param {number|null} ctx.puntiUltima — punti nell'ultima giornata giocata (null se nessuna)
 * @param {number|null} ctx.puntiMedia — media punti utente (null se nessun dato)
 * @param {boolean} ctx.giornataAperta — true se siamo in una giornata non ancora chiusa
 * @returns {string}
 */
export function getHeroPhrase({ puntiUltima, puntiMedia, giornataAperta }) {
  // Caso 1: nessuna giornata ancora giocata
  if (puntiUltima == null || puntiMedia == null) {
    return 'Si riparte.';
  }
  // Caso 2: giornata aperta (in corso, venerdì non ancora)
  if (giornataAperta) {
    return 'Schiera bene.';
  }
  // Caso 3: ultima giornata andata bene (≥ media + 5)
  if (puntiUltima >= puntiMedia + 5) {
    return 'Bella giornata.';
  }
  // Caso 4: ultima giornata disastrosa (≤ media - 5)
  if (puntiUltima <= puntiMedia - 5) {
    return 'Serve una rimonta.';
  }
  // Caso 5: nella media (± 5)
  return 'Si continua.';
}
