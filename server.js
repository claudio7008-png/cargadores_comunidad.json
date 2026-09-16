const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const ARCHIVO_COMUNIDAD = path.join(__dirname, 'estaciones_comunidad.json');

function leerEstacionesGuardadas() {
    try {
        if (fs.existsSync(ARCHIVO_COMUNIDAD)) {
            const contenido = fs.readFileSync(ARCHIVO_COMUNIDAD, 'utf-8');
            return JSON.parse(contenido);
        }
    } catch (error) {
        console.error("Error al leer el archivo JSON:", error.message);
    }
    return [];
}

function guardarEstacionesEnJSON(estaciones) {
    try {
        fs.writeFileSync(ARCHIVO_COMUNIDAD, JSON.stringify(estaciones, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al escribir el archivo JSON:", error.message);
    }
}

let estacionesComunidad = leerEstacionesGuardadas();

// Red de Muestra Ampliada de Argentina + Red Completa de Córdoba
let estacionesArgentina = [
    // CABA y Gran Buenos Aires
    { id: "arg-1", nombre: "YPF Punto Eléctrico - ACA Palermo (CABA)", latitud: -34.5808, longitud: -58.4202, tipoConector: "CCS2 / DC Carga Rápida (50kW)", origen: "Red YPF" },
    { id: "arg-2", nombre: "YPF Punto Eléctrico - Echeverría (CABA)", latitud: -34.5681, longitud: -58.4521, tipoConector: "Type 2 AC (22kW)", origen: "Red YPF" },
    { id: "arg-3", nombre: "Chargebox Net - Shopping Unicenter (Martínez)", latitud: -34.5086, longitud: -58.5235, tipoConector: "Type 2 (22kW)", origen: "Chargebox Net" },
    { id: "arg-4", nombre: "Axion Energy - Av. del Libertador (Vicente López)", latitud: -34.5312, longitud: -58.4682, tipoConector: "CCS2 / CHAdeMO (50kW)", origen: "Red Axion" },
    { id: "arg-5", nombre: "Chargebox Net - Alto Palermo Shopping", latitud: -34.5882, longitud: -58.4103, tipoConector: "Type 2 (22kW)", origen: "Chargebox Net" },
    { id: "arg-6", nombre: "YPF Punto Eléctrico - Alcorta (CABA)", latitud: -34.5731, longitud: -58.4050, tipoConector: "CCS2 (50kW)", origen: "Red YPF" },

    // Corredor Atlántico y Provincia de Buenos Aires
    { id: "arg-7", nombre: "YPF Punto Eléctrico - Ruta 2 Km 202 (Dolores)", latitud: -36.3131, longitud: -57.6794, tipoConector: "CCS2 (50kW)", origen: "Red YPF" },
    { id: "arg-8", nombre: "YPF Punto Eléctrico - Chascomús", latitud: -35.5761, longitud: -58.0125, tipoConector: "CCS2 (50kW)", origen: "Red YPF" },
    { id: "arg-9", nombre: "YPF Punto Eléctrico - Lezama (Ruta 2)", latitud: -35.9615, longitud: -57.8892, tipoConector: "CCS2 (50kW)", origen: "Red YPF" },
    { id: "arg-10", nombre: "Estación de Carga Siemens - Bahía Blanca", latitud: -38.7183, longitud: -62.2663, tipoConector: "Type 2 (11kW)", origen: "Red Siemens" },
    { id: "arg-11", nombre: "Chargebox Net - Mar del Plata Golf Club", latitud: -38.0335, longitud: -57.5381, tipoConector: "Type 2 (22kW)", origen: "Chargebox Net" },

    // Red de Córdoba
    { id: "cba-1", nombre: "YPF Punto Eléctrico - Av. Capdevila y Circunvalación", latitud: -31.3785, longitud: -64.1352, tipoConector: "CCS2 / CHAdeMO / Type 2 (50kW Carga Rápida)", origen: "Red YPF" },
    { id: "cba-2", nombre: "YPF Punto Eléctrico - Av. Ejército Argentino (Valle Escondido)", latitud: -31.3768, longitud: -64.2690, tipoConector: "CCS2 / CHAdeMO / Type 2 (50kW Carga Rápida)", origen: "Red YPF" },
    { id: "cba-3", nombre: "Punto E EPEC - Paseo del Buen Pastor (Centro)", latitud: -31.4233, longitud: -64.1878, tipoConector: "Type 2 (22kW)", origen: "Red EPEC" },
    { id: "cba-4", nombre: "Punto E EPEC - Parque del Chateau", latitud: -31.3725, longitud: -64.2541, tipoConector: "Type 2 (25kW)", origen: "Red EPEC" },
    { id: "cba-5", nombre: "EPEC / Scame - Blvd. Mitre", latitud: -31.4111, longitud: -64.1795, tipoConector: "Type 2 AC (Gratuito)", origen: "EPEC / Scame" },
    { id: "cba-6", nombre: "Chargebox Net - Hotel Sheraton Córdoba", latitud: -31.4135, longitud: -64.1951, tipoConector: "Type 2 (22kW)", origen: "Chargebox Net" },
    { id: "cba-7", nombre: "DS Store Córdoba - Av. Colón", latitud: -31.3985, longitud: -64.2251, tipoConector: "Type 2 (7kW)", origen: "DS / Privado" },
    { id: "cba-8", nombre: "EPEC Punto E - Villa Carlos Paz (Costanera)", latitud: -31.4172, longitud: -64.4988, tipoConector: "Type 2 (22kW)", origen: "Red EPEC" },
    { id: "cba-9", nombre: "YPF Punto Eléctrico - Villa María", latitud: -32.4075, longitud: -63.2402, tipoConector: "CCS2 / CHAdeMO (50kW)", origen: "Red YPF" },
    { id: "cba-10", nombre: "EPEC Punto E - Río Ceballos (Ruta E53)", latitud: -31.1645, longitud: -64.3168, tipoConector: "Type 2 (22kW)", origen: "Red EPEC" },
    { id: "cba-11", nombre: "Punto de Carga - Hotel Yacanto (Valle de Calamuchita)", latitud: -31.9560, longitud: -65.0450, tipoConector: "Type 2 (22kW)", origen: "Comunidad" },
    { id: "cba-12", nombre: "Punto E EPEC - San Francisco", latitud: -31.4278, longitud: -62.0825, tipoConector: "Type 2 (22kW)", origen: "Red EPEC" },

    // Cuyo, NOA y Patagonia
    { id: "arg-14", nombre: "Punto Eléctrico Rosario - Costanera", latitud: -32.9325, longitud: -60.6558, tipoConector: "Type 2 (22kW)", origen: "Comunidad" },
    { id: "arg-15", nombre: "Chargebox Net - Mendoza Plaza Shopping", latitud: -32.8983, longitud: -68.8092, tipoConector: "Type 2 (22kW)", origen: "Chargebox Net" },
    { id: "arg-17", nombre: "Cargador EV - San Miguel de Tucumán Centro", latitud: -26.8300, longitud: -65.2050, tipoConector: "Type 2 (22kW)", origen: "Comunidad" },
    { id: "arg-18", nombre: "Punto de Carga - Neuquén Capital", latitud: -38.9516, longitud: -68.0591, tipoConector: "Type 2 (22kW)", origen: "Red Local" }
];

app.get('/api/estaciones', async (req, res) => {
    let estacionesAPI = [];

    try {
        const response = await axios.get('https://api.openchargemap.io/v3/poi/', {
            params: {
                output: 'json',
                countrycode: 'AR',
                maxresults: 200,
                compact: true
            },
            timeout: 4000
        });

        estacionesAPI = response.data.map(item => ({
            id: `ocm-${item.ID}`,
            nombre: item.AddressInfo?.Title || "Cargador EV",
            latitud: item.AddressInfo?.Latitude,
            longitud: item.AddressInfo?.Longitude,
            tipoConector: item.Connections?.[0]?.ConnectionType?.Title || "Estándar",
            origen: "OpenChargeMap (Comunidad Global)"
        })).filter(e => e.latitud && e.longitud);

    } catch (error) {
        console.log("Servidor: Mostrando red local integrada.");
    }

    const resultadoTotal = [...estacionesArgentina, ...estacionesAPI, ...estacionesComunidad];
    console.log(`Enviando ${resultadoTotal.length} puntos de carga al mapa.`);
    res.json(resultadoTotal);
});

app.post('/api/estaciones', (req, res) => {
    const { nombre, latitud, longitud, tipoConector } = req.body;

    if (!nombre || !latitud || !longitud) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const nuevaEstacion = {
        id: `user-${Date.now()}`,
        nombre,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        tipoConector: tipoConector || "Estándar",
        origen: "Aporte Comunidad (Guardado Local)"
    };

    estacionesComunidad.push(nuevaEstacion);
    guardarEstacionesEnJSON(estacionesComunidad);

    res.status(201).json({ mensaje: "¡Guardado con éxito!", estacion: nuevaEstacion });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Servidor listo en http://localhost:3000");
});