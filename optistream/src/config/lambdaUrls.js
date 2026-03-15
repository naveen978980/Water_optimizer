/**
 * AWS Lambda Function URLs
 *
 * If you are using API Gateway (single base URL + paths), update API_BASE.
 * If you are using individual Lambda Function URLs, replace each entry below.
 *
 * Lambda Function URL format:
 *   https://<url-id>.lambda-url.<region>.on.aws
 */
const API_BASE = 'https://ilpr3egenccwda7wyglcxhjtja0sddey.lambda-url.us-east-1.on.aws'

// 👇 PASTE YOUR GAUGE IMAGE UPLOAD LAMBDA URL HERE
const GAUGE_IMAGE_LAMBDA = 'https://xhg23suojsjhzclupjsys4kxni0mopqx.lambda-url.us-east-1.on.aws/'

// 👇 PASTE YOUR WATER SUSTAINABILITY LAMBDA URL HERE (Deploy backend/water_sustainability_lambda.py first!)
const WATER_SUSTAINABILITY_LAMBDA = 'NOT_YET_DEPLOYED'

// 👇 VOLUME DATABASE LAMBDA (returns volumetric data from DB)
const VOLUME_DB_LAMBDA = 'https://qtsykkghnbzrktvuy7kmyjndn40culev.lambda-url.us-east-1.on.aws/'

export const LAMBDA = {
  /** GET  /locations  → [{ id, label }] */
  LOCATIONS: `${API_BASE}/locations`,

  /** GET  /gauge?location=<id>  → { currentGauge, trend, lastUpdated } */
  GAUGE: `${API_BASE}/gauge`,

  /** GET  /citizen/profile  → { greeting, trustScore, avatarUrl } */
  CITIZEN_PROFILE: `${API_BASE}/citizen/profile`,

  /** GET  /mission  → { title, status, bounty } */
  MISSION: `${API_BASE}/mission`,

  /** GET  /weather  → { message, schedule } */
  WEATHER_ALERT: `${API_BASE}/weather`,

  /** GET  /flood-zones  → [{ id, stroke, fill, coordinates }] */
  FLOOD_ZONES: `${API_BASE}/flood-zones`,

  /** GET  /sustainability/metrics  → { currentVolume, population, evaporationLoss } */
  SUSTAINABILITY_METRICS: `${API_BASE}/sustainability/metrics`,

  /** GET  /sustainability/autonomy  → { daysLeft, capacityPercent } */
  AUTONOMY: `${API_BASE}/sustainability/autonomy`,

  /** GET  /sustainability/quality  → { message } */
  QUALITY_AGENT: `${API_BASE}/sustainability/quality`,

  /** GET  /sustainability/infra  → { title, description, geojson? } */
  INFRA_AGENT: `${API_BASE}/sustainability/infra`,

  /** POST (JSON: { image: base64, filename })  → { level, location, message } */
  GAUGE_UPLOAD: GAUGE_IMAGE_LAMBDA,

  /** POST /volume  (JSON: { geojson: MultiPolygon, depth: number })  → { area_m2, depth_m, volume_m3 } */
  VOLUME: `${API_BASE}/volume`,

  /** GET /volume-db  → Returns volumetric data from database for all locations */
  VOLUME_DB: VOLUME_DB_LAMBDA,

  /** POST /water-body  (JSON: { image: base64, filename })  → { area_m2, depth_m, volume_m3, message } */
  WATER_BODY_UPLOAD: `${API_BASE}/water-body`,

  /** POST /water-sustainability  (JSON: { volume: number, area: number, depth: number, population: number })  → sustainability metrics */
  WATER_SUSTAINABILITY: WATER_SUSTAINABILITY_LAMBDA,
}
