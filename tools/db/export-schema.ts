/**
 * Extrait le schéma seul, sans aucune donnée, vers docs/schema.txt : c'est ce fichier que l'on donne à l'agent.
 * Extension .txt et non .sql, car les règles de l'agent bloquent les *.sql.
 *
 *   node tools/db/export-schema.ts [base] [sortie]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const databasePath = process.argv[2] ?? 'data/prono.db';
const outputPath = process.argv[3] ?? 'docs/schema.txt';

const db = new DatabaseSync(databasePath, { readOnly: true });
const rows = db
  .prepare(
    `SELECT sql FROM sqlite_master
     WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
     ORDER BY type DESC, name`,
  )
  .all();
db.close();

const schema = rows.map((row) => `${String(row['sql'])};`).join('\n\n');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `-- Schéma extrait de ${databasePath}, sans données.\n\n${schema}\n`);
console.log(`Schéma écrit dans ${outputPath} (${rows.length} objets).`);
