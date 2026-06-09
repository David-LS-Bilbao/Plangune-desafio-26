import { describe, it, expect } from 'vitest';

import { normalizeDataPlaneToEvent, coerceBool } from '../utils/normalizeDataEvent.js';

describe('coerceBool', () => {
  it('respeta booleanos nativos', () => {
    expect(coerceBool(true)).toBe(true);
    expect(coerceBool(false)).toBe(false);
  });

  it('convierte "True"/"False" a boolean real', () => {
    expect(coerceBool('True')).toBe(true);
    expect(coerceBool('False')).toBe(false);
  });

  it('acepta "true"/"false" y tolera mayúsculas/espacios', () => {
    expect(coerceBool('true')).toBe(true);
    expect(coerceBool('FALSE')).toBe(false);
    expect(coerceBool('  True ')).toBe(true);
  });

  it('evita el bug Boolean("False") === true', () => {
    expect(coerceBool('False')).toBe(false);
  });

  it('null/undefined → false', () => {
    expect(coerceBool(null)).toBe(false);
    expect(coerceBool(undefined)).toBe(false);
  });
});

describe('normalizeDataPlaneToEvent', () => {
  const dataPlane = {
    nombre: 'Aizian',
    descripcion: 'Restaurante acogedor',
    direccion: 'Lehendakari Leizaola, 29',
    precio: null,
    municipio: 'Bilbao',
    territorio: 'bizkaia',
    categoria: 'restauracion',
    es_carrito: true,
    es_cambiador: false,
    es_lluvia: true,
    es_mascotas: 'False',
    es_silla_ruedas: 'True',
    edad_minima: '0',
    lat: 43.26751936,
    lng: -2.94180662,
    website: 'https://www.restaurante-aizian.com/',
    telefono: '944 280 039',
    email: 'aizian@restaurante-aizian.com',
    external_id: 'https://turismoa.euskadi.eus/.../restaurante-aizian/',
  };

  it('mapea nombre→title, descripcion→description, direccion→address, precio→price', () => {
    const e = normalizeDataPlaneToEvent(dataPlane);
    expect(e.title).toBe('Aizian');
    expect(e.description).toBe('Restaurante acogedor');
    expect(e.address).toBe('Lehendakari Leizaola, 29');
    expect(e.price).toBeNull();
  });

  it('mapea es_interior desde es_lluvia', () => {
    expect(normalizeDataPlaneToEvent(dataPlane).es_interior).toBe(true);
  });

  it('convierte los booleanos string a boolean real', () => {
    const e = normalizeDataPlaneToEvent(dataPlane);
    expect(e.es_silla_ruedas).toBe(true);
    expect(e.es_mascotas).toBe(false);
    expect(typeof e.es_mascotas).toBe('boolean');
    expect(e.es_carrito).toBe(true);
    expect(e.es_cambiador).toBe(false);
  });

  it('edad_minima como número', () => {
    const e = normalizeDataPlaneToEvent(dataPlane);
    expect(e.edad_minima).toBe(0);
    expect(typeof e.edad_minima).toBe('number');
  });

  it('lat/lng como número', () => {
    const e = normalizeDataPlaneToEvent(dataPlane);
    expect(typeof e.lat).toBe('number');
    expect(e.lat).toBeCloseTo(43.2675, 3);
    expect(typeof e.lng).toBe('number');
  });

  it('id null si Data no trae id; business_id null; fuente "data-api"', () => {
    const e = normalizeDataPlaneToEvent(dataPlane);
    expect(e.id).toBeNull();
    expect(e.business_id).toBeNull();
    expect(e.fuente).toBe('data-api');
  });

  it('no arrastra claves crudas de Data (nombre, precio, direccion, es_lluvia)', () => {
    const e = normalizeDataPlaneToEvent(dataPlane);
    expect(e.nombre).toBeUndefined();
    expect(e.precio).toBeUndefined();
    expect(e.direccion).toBeUndefined();
    expect(e.es_lluvia).toBeUndefined();
  });

  it('respeta id si Data lo trae', () => {
    expect(normalizeDataPlaneToEvent({ ...dataPlane, id: 5 }).id).toBe(5);
  });

  it('edad_minima null y lat/lng null si no vienen', () => {
    const e = normalizeDataPlaneToEvent({ nombre: 'X' });
    expect(e.edad_minima).toBeNull();
    expect(e.lat).toBeNull();
    expect(e.lng).toBeNull();
    expect(e.title).toBe('X');
  });
});
