const ENVIRONMENT = "production";

const API_URLS = {
    local: "http://localhost:3000",
    production: "https://rifajackback-production.up.railway.app"
};

if (!API_URLS[ENVIRONMENT]) {
    throw new Error(`Entorno no válido: ${ENVIRONMENT}`);
}

const baseUrl = API_URLS[ENVIRONMENT].replace(/\/+$/, "");

const CONFIG = Object.freeze({
    ENVIRONMENT,
    API_URL: baseUrl,
    apiUrl: (path = "") => `${baseUrl}/${path.replace(/^\/+/, "")}`
});

export default CONFIG;