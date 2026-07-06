async function carregarGeoSampa() {

    console.log("Sistema territorial carregado (OpenStreetMap)");

}


   //municipios + bairros
async function obterMunicipiosPorRaio(lat, lon, raioKm) {

    const origem = turf.point([lon, lat]);

    /* ---------------- bairros ---------------- */

    const query = `
[out:json][timeout:30];

(
    node["place"~"suburb|neighbourhood|quarter"]
    (around:${raioKm * 1000},${lat},${lon});
);

out body;
`;

    const response = await HttpClientGeo.request(
        "https://overpass-api.de/api/interpreter",
        {
            method: "POST",
            body: query,
            headers: {
                "Content-Type": "text/plain"
            }
        }
    );

    if (!response?.elements?.length)
        return [];

    const municipiosMap = new Map();

    for (const item of response.elements) {

        const distancia = turf.distance(
            origem,
            turf.point([item.lon, item.lat]),
            { units: "kilometers" }
        );

        /* ---------------- Reverse Geocoding ---------------- */

        const reverse = await HttpClientGeo.request(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${item.lat}&lon=${item.lon}`
        );

        const address = reverse.address || {};

        const municipio =

            address.city ||

            address.town ||

            address.municipality ||

            address.county ||

            address.state_district ||

            "Município";

        if (!municipiosMap.has(municipio)) {

            municipiosMap.set(municipio, {

                nome: municipio,

                lat: item.lat,

                lon: item.lon,

                distancia: Number(distancia.toFixed(2)),

                bairros: []

            });

        }

        const registro = municipiosMap.get(municipio);

        registro.bairros.push({

            nome: item.tags?.name || "Bairro",

            tipo: item.tags?.place || "",

            lat: item.lat,

            lon: item.lon,

            distancia: Number(distancia.toFixed(2))

        });

        /* Mantém a menor distância do município */

        if (distancia < registro.distancia) {

            registro.distancia = Number(distancia.toFixed(2));

            registro.lat = item.lat;

            registro.lon = item.lon;

        }

    }

    const municipios = [...municipiosMap.values()];

    municipios.forEach(m =>

        m.bairros.sort(
            (a, b) => a.distancia - b.distancia
        )

    );

    municipios.sort(
        (a, b) => a.distancia - b.distancia
    );

    return municipios;

}

   //todos os bairros
async function obterBairrosPorRaio(lat, lon, raioKm) {

    const municipios =
        await obterMunicipiosPorRaio(
            lat,
            lon,
            raioKm
        );

    return municipios
        .flatMap(m =>
            m.bairros.map(b => ({
                ...b,
                municipio: m.nome
            }))
        )
        .sort((a, b) => a.distancia - b.distancia);

}
