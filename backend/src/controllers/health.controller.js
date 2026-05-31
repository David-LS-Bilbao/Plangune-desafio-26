/**
 * GET /api/health
 * Healthcheck simple para verificar que la API responde.
 */
export function getHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'DESAFIO-26 API',
  });
}

export default getHealth;
