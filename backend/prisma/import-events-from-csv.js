#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { PrismaClient } from '@prisma/client';

const FIELD_LIMITS = {
  fuente: 20,
  title: 150,
  categoria: 50,
  tipo_plantilla: 100,
  municipio: 100,
  territorio: 30,
  telefono: 30,
  email: 100,
  lugar: 255,
  tipo_evento: 100,
};

const BOOLEAN_FIELDS = ['es_carrito', 'es_cambiador', 'es_silla_ruedas', 'es_mascotas'];
const INSERT_BATCH_SIZE = 200;

function printHelp() {
  console.log(`Uso:
  node backend/prisma/import-events-from-csv.js --file <path> [--limit <n>] [--dry-run] [--skip-duplicates]

Opciones:
  --file <path>       Ruta al CSV separado por punto y coma.
  --limit <n>         Procesa solo las primeras n filas de datos.
  --dry-run           Lee, normaliza y reporta sin insertar datos.
  --skip-duplicates   Conserva solo la primera fila por clave compuesta normalizada.
  --help              Muestra esta ayuda.

Seguridad:
  Sin --file, este script no inserta nada.
  Con --dry-run, este script no conecta con la base de datos.
  Nunca ejecuta TRUNCATE ni borra datos.`);
}

function parseArgs(argv) {
  const args = {
    file: null,
    limit: null,
    dryRun: false,
    skipDuplicates: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--skip-duplicates') {
      args.skipDuplicates = true;
    } else if (arg === '--file') {
      args.file = argv[i + 1] ?? null;
      i += 1;
    } else if (arg.startsWith('--file=')) {
      args.file = arg.slice('--file='.length);
    } else if (arg === '--limit') {
      args.limit = parseLimit(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--limit=')) {
      args.limit = parseLimit(arg.slice('--limit='.length));
    } else {
      throw new Error(`Argumento no reconocido: ${arg}`);
    }
  }

  return args;
}

function parseLimit(value) {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error('--limit debe ser un entero positivo');
  }
  return limit;
}

function parseCsv(text, delimiter = ';') {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const input = text.replace(/^\uFEFF/, '');

  while (i < input.length) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i += 1;
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      if (char === '\r' && next === '\n') i += 2;
      else i += 1;
      continue;
    }

    field += char;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((csvRow) => csvRow.some((value) => value.trim() !== ''));
  const [headers = [], ...dataRows] = nonEmptyRows;
  const normalizedHeaders = headers.map((header) => header.trim());

  return dataRows.map((csvRow) => {
    const item = {};
    normalizedHeaders.forEach((header, index) => {
      item[header] = csvRow[index] ?? '';
    });
    return item;
  });
}

function cleanString(value) {
  const normalized = value === null || value === undefined ? '' : String(value);
  return normalized.trim();
}

function nullIfEmpty(value) {
  const cleaned = cleanString(value);
  return cleaned === '' ? null : cleaned;
}

function isPlaceholderTitle(value) {
  return cleanString(value).toLowerCase() === 'sin titulo'
    || cleanString(value).toLowerCase() === 'sin titulo'
    || cleanString(value).toLowerCase() === 'sin título';
}

function isUrl(value) {
  return /^https?:\/\//i.test(cleanString(value));
}

function isLegibleName(value) {
  const cleaned = cleanString(value);
  if (!cleaned || isPlaceholderTitle(cleaned) || isUrl(cleaned)) return false;
  return /[\p{L}\p{N}]/u.test(cleaned);
}

function truncateField(field, value, stats) {
  const limit = FIELD_LIMITS[field];
  if (!limit || value === null || value === undefined) return value;

  const stringValue = String(value);
  if (stringValue.length <= limit) return stringValue;

  stats.truncations[field] = (stats.truncations[field] ?? 0) + 1;
  return stringValue.slice(0, limit);
}

function parseBoolean(value) {
  const cleaned = cleanString(value).toLowerCase();
  if (cleaned === 'true') return true;
  if (cleaned === 'false') return false;
  return false;
}

function parseNullableNumber(value) {
  const cleaned = cleanString(value).replace(',', '.');
  if (cleaned === '') return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function parsePositiveInteger(value) {
  const cleaned = cleanString(value);
  if (!/^\d+$/.test(cleaned)) return null;
  const number = Number(cleaned);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parseRequiredDate(value) {
  const cleaned = cleanString(value);
  if (cleaned === '') return null;
  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseOptionalDate(value) {
  const cleaned = cleanString(value);
  if (cleaned === '') return null;
  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizePrice(value) {
  const cleaned = cleanString(value);
  if (cleaned === '') return null;
  return cleaned === '0' ? 'Gratis' : cleaned;
}

function normalizeFuente(row) {
  const fuente = cleanString(row.fuente);
  const businessId = cleanString(row.business_id).toLowerCase();
  const lower = fuente.toLowerCase();

  if (businessId === 'google_places' || lower.includes('google')) return 'google_places';
  if (lower.includes('kulturklik')) return 'kulturklik';
  if (lower.includes('turismoa.euskadi') || lower.includes('turismo.euskadi')) return 'turismo';
  return 'data';
}

function chooseTitle(row) {
  const externalId = cleanString(row.external_id);
  const csvTitle = cleanString(row.title);

  if (isLegibleName(externalId)) return externalId;
  if (isLegibleName(csvTitle)) return csvTitle;
  return 'Sin titulo';
}

function chooseDescription(row, normalizedTitle) {
  const csvTitle = cleanString(row.title);
  const csvDescription = cleanString(row.description);

  if (
    isLegibleName(csvTitle)
    && !isPlaceholderTitle(csvTitle)
    && csvTitle !== normalizedTitle
  ) {
    return csvTitle;
  }

  return csvDescription === '' ? null : csvDescription;
}

function normalizeRow(row, stats) {
  const fechaInicio = parseRequiredDate(row.fecha_inicio);
  if (!fechaInicio) {
    return {
      valid: false,
      reason: 'fecha_inicio ausente o invalida',
      event: null,
    };
  }

  const rawFuente = cleanString(row.fuente);
  const titleBeforeTruncate = chooseTitle(row);
  const event = {
    business_id: parsePositiveInteger(row.business_id),
    fuente: normalizeFuente(row),
    external_id: nullIfEmpty(row.external_id),
    title: titleBeforeTruncate,
    description: chooseDescription(row, titleBeforeTruncate),
    categoria: nullIfEmpty(row.categoria),
    tipo_plantilla: nullIfEmpty(row.tipo_plantilla),
    municipio: nullIfEmpty(row.municipio),
    territorio: nullIfEmpty(row.territorio),
    address: nullIfEmpty(row.address),
    lat: parseNullableNumber(row.lat),
    lng: parseNullableNumber(row.lng),
    telefono: nullIfEmpty(row.telefono),
    email: nullIfEmpty(row.email),
    website: nullIfEmpty(row.website) ?? (isUrl(rawFuente) ? rawFuente : null),
    es_interior: parseBoolean(row.es_interior),
    es_carrito: parseBoolean(row.es_carrito),
    es_cambiador: parseBoolean(row.es_cambiador),
    es_silla_ruedas: parseBoolean(row.es_silla_ruedas),
    es_mascotas: parseBoolean(row.es_mascotas),
    edad_minima: parseNullableNumber(row.edad_minima) ?? 0,
    multiplicador: 1.00,
    fecha_inicio: fechaInicio,
    fecha_fin: parseOptionalDate(row.fecha_fin),
    lugar: nullIfEmpty(row.lugar),
    price: normalizePrice(row.price),
    imagen_url: nullIfEmpty(row.imagen_url),
    tipo_evento: nullIfEmpty(row.tipo_evento),
  };

  for (const field of Object.keys(FIELD_LIMITS)) {
    event[field] = truncateField(field, event[field], stats);
  }

  return {
    valid: true,
    reason: null,
    event,
  };
}

function createInitialStats(rowsRead, rowsProcessed) {
  return {
    rowsRead,
    rowsProcessed,
    validRows: 0,
    skippedRows: 0,
    skipReasons: {},
    duplicateExternalIds: 0,
    duplicateExternalIdExamples: [],
    duplicateCompositeKeys: 0,
    duplicateCompositeKeyExamples: [],
    duplicateExistingDbRows: 0,
    duplicateExistingDbExamples: [],
    rowsImportableAfterCsvDuplicates: 0,
    rowsImportableReally: 0,
    truncations: {},
    booleans: Object.fromEntries(
      BOOLEAN_FIELDS.map((field) => [field, { true: 0, false: 0 }]),
    ),
    examples: [],
  };
}

function countDuplicateExternalIds(events, stats) {
  const counts = new Map();
  for (const event of events) {
    if (!event.external_id) continue;
    counts.set(event.external_id, (counts.get(event.external_id) ?? 0) + 1);
  }

  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  stats.duplicateExternalIds = duplicates.length;
  stats.duplicateExternalIdExamples = duplicates
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([externalId, count]) => ({ external_id: externalId, count }));
}

function normalizeKeyPart(value) {
  return cleanString(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function buildCompositeKey(event) {
  return [
    normalizeKeyPart(event.title),
    normalizeKeyPart(event.municipio),
    event.fecha_inicio.toISOString(),
    normalizeKeyPart(event.lugar ?? ''),
  ].join('\u001F');
}

function summarizeCompositeKey(event) {
  return {
    title: event.title,
    municipio: event.municipio ?? '',
    fecha_inicio: event.fecha_inicio.toISOString(),
    lugar: event.lugar ?? '',
  };
}

function countDuplicateCompositeKeys(events, stats) {
  const counts = new Map();
  const firstEventByKey = new Map();

  for (const event of events) {
    const key = buildCompositeKey(event);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!firstEventByKey.has(key)) firstEventByKey.set(key, event);
  }

  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  stats.duplicateCompositeKeys = duplicates.length;
  stats.duplicateCompositeKeyExamples = duplicates
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({
      ...summarizeCompositeKey(firstEventByKey.get(key)),
      count,
    }));
}

function skipDuplicateEvents(events) {
  const seen = new Set();
  const uniqueEvents = [];

  for (const event of events) {
    const key = buildCompositeKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueEvents.push(event);
  }

  return uniqueEvents;
}

function buildNormalizedEvents(rows, limit, skipDuplicates = false) {
  const selectedRows = limit ? rows.slice(0, limit) : rows;
  const stats = createInitialStats(rows.length, selectedRows.length);
  const events = [];

  selectedRows.forEach((row) => {
    const normalized = normalizeRow(row, stats);

    if (!normalized.valid) {
      stats.skippedRows += 1;
      stats.skipReasons[normalized.reason] = (stats.skipReasons[normalized.reason] ?? 0) + 1;
      return;
    }

    stats.validRows += 1;
    events.push(normalized.event);

    for (const field of BOOLEAN_FIELDS) {
      const key = normalized.event[field] ? 'true' : 'false';
      stats.booleans[field][key] += 1;
    }

    if (stats.examples.length < 5) {
      stats.examples.push(serializeForReport(normalized.event));
    }
  });

  countDuplicateExternalIds(events, stats);
  countDuplicateCompositeKeys(events, stats);

  const eventsToImport = skipDuplicates ? skipDuplicateEvents(events) : events;
  stats.rowsImportableAfterCsvDuplicates = eventsToImport.length;
  stats.rowsImportableReally = eventsToImport.length;

  return { events, eventsToImport, stats };
}

function serializeForReport(event) {
  return {
    ...event,
    fecha_inicio: event.fecha_inicio.toISOString(),
    fecha_fin: event.fecha_fin ? event.fecha_fin.toISOString() : null,
  };
}

function printReport(stats, mode) {
  console.log(`Modo: ${mode}`);
  console.log(`Filas leidas: ${stats.rowsRead}`);
  console.log(`Filas procesadas: ${stats.rowsProcessed}`);
  console.log(`Filas validas: ${stats.validRows}`);
  console.log(`Filas saltadas: ${stats.skippedRows}`);
  console.log(`Duplicados de external_id: ${stats.duplicateExternalIds}`);
  console.log(`Duplicados por clave compuesta: ${stats.duplicateCompositeKeys}`);
  console.log(`Duplicados ya existentes en DB: ${stats.duplicateExistingDbRows}`);
  console.log(`Filas importables tras deduplicar CSV: ${stats.rowsImportableAfterCsvDuplicates}`);
  console.log(`Filas que se importarian realmente: ${stats.rowsImportableReally}`);

  if (stats.duplicateExternalIdExamples.length > 0) {
    console.log('Ejemplos de external_id duplicados:');
    console.log(JSON.stringify(stats.duplicateExternalIdExamples, null, 2));
  }

  if (stats.duplicateCompositeKeyExamples.length > 0) {
    console.log('Ejemplos de clave compuesta duplicada:');
    console.log(JSON.stringify(stats.duplicateCompositeKeyExamples, null, 2));
  }

  if (stats.duplicateExistingDbExamples.length > 0) {
    console.log('Ejemplos ya existentes en DB:');
    console.log(JSON.stringify(stats.duplicateExistingDbExamples, null, 2));
  }

  console.log('Conteo booleanos familiares:');
  console.log(JSON.stringify(stats.booleans, null, 2));

  console.log('Truncamientos por campo:');
  console.log(JSON.stringify(stats.truncations, null, 2));

  if (Object.keys(stats.skipReasons).length > 0) {
    console.log('Motivos de filas saltadas:');
    console.log(JSON.stringify(stats.skipReasons, null, 2));
  }

  console.log('5 ejemplos normalizados:');
  console.log(JSON.stringify(stats.examples, null, 2));
}

async function filterValidBusinessIds(prisma, events) {
  const candidateIds = [...new Set(events.map((event) => event.business_id).filter(Boolean))];
  if (candidateIds.length === 0) return events;

  const businesses = await prisma.business.findMany({
    where: { id: { in: candidateIds } },
    select: { id: true },
  });
  const existingIds = new Set(businesses.map((business) => business.id));

  return events.map((event) => ({
    ...event,
    business_id: event.business_id && existingIds.has(event.business_id) ? event.business_id : null,
  }));
}

async function filterExistingDbDuplicates(prisma, events, stats) {
  if (events.length === 0) return events;

  const existingEvents = await prisma.event.findMany({
    select: {
      title: true,
      municipio: true,
      fecha_inicio: true,
      lugar: true,
    },
  });
  const existingKeys = new Set(existingEvents.map((event) => buildCompositeKey(event)));
  const filteredEvents = [];

  for (const event of events) {
    if (existingKeys.has(buildCompositeKey(event))) {
      stats.duplicateExistingDbRows += 1;
      if (stats.duplicateExistingDbExamples.length < 5) {
        stats.duplicateExistingDbExamples.push(summarizeCompositeKey(event));
      }
      continue;
    }

    filteredEvents.push(event);
  }

  stats.rowsImportableReally = filteredEvents.length;
  return filteredEvents;
}

async function insertEvents(prisma, events) {
  const safeEvents = await filterValidBusinessIds(prisma, events);
  let inserted = 0;

  for (let index = 0; index < safeEvents.length; index += INSERT_BATCH_SIZE) {
    const batch = safeEvents.slice(index, index + INSERT_BATCH_SIZE);
    const result = await prisma.event.createMany({ data: batch });
    inserted += result.count;
  }

  console.log(`Filas insertadas: ${inserted}`);
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    printHelp();
    process.exitCode = 1;
    return;
  }

  if (args.help || !args.file) {
    printHelp();
    return;
  }

  const csvText = await readFile(args.file, 'utf8');
  const rows = parseCsv(csvText);
  const { eventsToImport, stats } = buildNormalizedEvents(rows, args.limit, args.skipDuplicates);
  let finalEventsToImport = eventsToImport;
  let prisma = null;

  if (args.skipDuplicates) {
    prisma = new PrismaClient();
    finalEventsToImport = await filterExistingDbDuplicates(prisma, eventsToImport, stats);
  }

  if (args.dryRun) {
    printReport(stats, 'dry-run');
    if (prisma) await prisma.$disconnect();
    return;
  }

  printReport(stats, 'insert');
  try {
    if (!prisma) prisma = new PrismaClient();
    await insertEvents(prisma, finalEventsToImport);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message ?? error}`);
  process.exitCode = 1;
});
