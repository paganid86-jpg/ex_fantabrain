import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_ORBITAL_ACTIONS,
  buildOrbitalActionRequest,
  parseOrbitalActionResponse,
} from '../lib/orbitalActions.js';

describe('orbital AI actions', () => {
  it('builds a trade offer prompt with the expected verdict contract', () => {
    const request = buildOrbitalActionRequest('valutaOfferta', {
      offerta: {
        giocatoreRichiesto: 'Lautaro Martinez',
        giocatoreOfferto: 'Dusan Vlahovic',
        da: 'FC Test',
      },
      rosa: [{ nome: 'Marcus', cognome: 'Thuram', squadra: 'Inter', ruoloMantra: 'PC' }],
      giornata: 15,
    });

    assert.equal(request.action, 'valutaOfferta');
    assert.equal(request.maxTokens, 450);
    assert.match(request.systemPrompt, /Fantacalcio Mantra/i);
    assert.match(request.userMessage, /ACCETTA/);
    assert.match(request.userMessage, /RIFIUTA/);
    assert.match(request.userMessage, /CONTROPROPONI/);
    assert.match(request.userMessage, /Lautaro Martinez/);
  });

  it('builds a three-step war room prompt', () => {
    const request = buildOrbitalActionRequest('warRoomAnalisi', {
      miaRosa: [{ nome: 'Nico', cognome: 'Paz', squadra: 'Como', ruoloMantra: 'T' }],
      nomeAvversario: 'FC Rivale',
      giornata: 16,
    });

    assert.equal(request.responseFormat, 'json');
    assert.match(request.userMessage, /avversario/i);
    assert.match(request.userMessage, /vantaggi/i);
    assert.match(request.userMessage, /piano tattico/i);
  });

  it('normalizes known verdicts from model text', () => {
    const parsed = parseOrbitalActionResponse('valutaOfferta', 'Verdetto: CONTROPROPONI. Serve aggiungere crediti.');

    assert.equal(parsed.verdict, 'CONTROPROPONI');
    assert.equal(parsed.content, 'Verdetto: CONTROPROPONI. Serve aggiungere crediti.');
  });

  it('rejects unknown actions', () => {
    assert.throws(
      () => buildOrbitalActionRequest('azioneSconosciuta', {}),
      /Azione AI non supportata/
    );
    assert.ok(AI_ORBITAL_ACTIONS.includes('analizzaGiornata'));
  });
});
