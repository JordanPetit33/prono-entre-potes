import { AppData, Match, Player, Prediction, Result, Score } from '../models/app-data';

// Vérification de structure des données relues depuis le stockage. Écrite à la main : pas de bibliothèque.

type Obj = Record<string, unknown>;

function isObject(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isScoreValue(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 99;
}

function isScore(value: unknown): value is Score {
  return isObject(value) && isScoreValue(value['home']) && isScoreValue(value['away']);
}

function isPlayer(value: unknown): value is Player {
  return isObject(value) && isString(value['id']) && isString(value['name']) && isString(value['createdAt']);
}

function isMatch(value: unknown): value is Match {
  return (
    isObject(value) &&
    isString(value['id']) &&
    Number.isInteger(value['matchday']) &&
    (value['matchday'] as number) >= 1 &&
    isString(value['homeTeam']) &&
    isString(value['awayTeam']) &&
    isString(value['kickoff'])
  );
}

function isPrediction(value: unknown): value is Prediction {
  return (
    isObject(value) &&
    isString(value['playerId']) &&
    isString(value['matchId']) &&
    isScore(value['score']) &&
    isString(value['updatedAt'])
  );
}

function isResult(value: unknown): value is Result {
  return isObject(value) && isString(value['matchId']) && isScore(value['score']) && isString(value['enteredAt']);
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

/** Vrai si `value` a la forme d'un AppData, quel que soit son schemaVersion. */
export function hasAppDataShape(value: unknown): value is Omit<AppData, 'schemaVersion'> & { schemaVersion: number } {
  return (
    isObject(value) &&
    Number.isInteger(value['schemaVersion']) &&
    isObject(value['competition']) &&
    isString(value['competition']['name']) &&
    isArrayOf(value['players'], isPlayer) &&
    isArrayOf(value['matches'], isMatch) &&
    isArrayOf(value['predictions'], isPrediction) &&
    isArrayOf(value['results'], isResult)
  );
}
