// Cambia únicamente esta variable para alternar entre local y producción.
const ENVIRONMENT = "production";

const API_URLS = {
    local: "http://localhost:3000",
    production: "https://rifajackback-production.up.railway.app/"
};

if (!API_URLS[ENVIRONMENT]) {
    throw new Error(`Entorno no válido: ${ENVIRONMENT}`);
}

const CONFIG = Object.freeze({
    ENVIRONMENT,
    API_URL: API_URLS[ENVIRONMENT],
    apiUrl: (path = "") => `${API_URLS[ENVIRONMENT]}/${path.replace(/^\/+/, "")}`
});

export default CONFIG;
