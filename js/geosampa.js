let distritosGeojson = null;
let subprefeiturasGeojson = null;

/* ==========================================
   PROJEÇÕES
========================================== */

proj4.defs(
    "EPSG:31983",
    "+proj=utm +zone=23 +south +datum=SIRGAS2000 +units=m +no_defs"
);

/* ==========================================
   CARREGAR GEOSAMPA
========================================== */

async function carregarGeoSampa() {

    try {

        console.log(
            "Carregando GeoSampa..."
        );

        const distritoResponse =
            await fetch(
                "./assets/geojson/distritos.geojson"
            );

        distritosGeojson =
            await distritoResponse.json();

        const subprefResponse =
            await fetch(
                "./assets/geojson/subprefeituras.geojson"
            );

        subprefeiturasGeojson =
            await subprefResponse.json();

        converterGeoJson(
            distritosGeojson
        );

        converterGeoJson(
            subprefeiturasGeojson
        );

        console.log(
            "GeoSampa carregado."
        );

        console.log(
            "Distritos:",
            distritosGeojson.features.length
        );

        console.log(
            "Subprefeituras:",
            subprefeiturasGeojson.features.length
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar GeoSampa",
            erro
        );
    }
}

/* ==========================================
   CONVERTER GEOJSON
========================================== */

function converterGeoJson(
    geojson
) {

    geojson.features.forEach(
        feature => {

            const geometria =
                feature.geometry;

            if (
                geometria.type ===
                "Polygon"
            ) {

                geometria.coordinates =
                    geometria.coordinates.map(
                        anel =>
                            anel.map(
                                converterCoordenada
                            )
                    );
            }

            if (
                geometria.type ===
                "MultiPolygon"
            ) {

                geometria.coordinates =
                    geometria.coordinates.map(
                        poligono =>
                            poligono.map(
                                anel =>
                                    anel.map(
                                        converterCoordenada
                                    )
                            )
                    );
            }
        }
    );
}

/* ==========================================
   UTM -> WGS84
========================================== */

function converterCoordenada(
    coordenada
) {

    const resultado =
        proj4(
            "EPSG:31983",
            "EPSG:4326",
            coordenada
        );

    return [
        resultado[0],
        resultado[1]
    ];
}

/* ==========================================
   LAT/LON -> UTM
========================================== */

function converterParaUTM(
    latitude,
    longitude
) {

    const resultado =
        proj4(
            "EPSG:4326",
            "EPSG:31983",
            [
                longitude,
                latitude
            ]
        );

    return {

        x: resultado[0],
        y: resultado[1]

    };
}

/* ==========================================
   DISTRITO
========================================== */

function localizarDistrito(
    latitude,
    longitude
) {

    const ponto =
        turf.point([
            longitude,
            latitude
        ]);

    for (
        const distrito of
        distritosGeojson.features
    ) {

        if (
            turf.booleanPointInPolygon(
                ponto,
                distrito
            )
        ) {

            return distrito.properties;
        }
    }

    return null;
}

/* ==========================================
   SUBPREFEITURA
========================================== */

function localizarSubprefeitura(
    latitude,
    longitude
) {

    const ponto =
        turf.point([
            longitude,
            latitude
        ]);

    for (
        const subprefeitura of
        subprefeiturasGeojson.features
    ) {

        if (
            turf.booleanPointInPolygon(
                ponto,
                subprefeitura
            )
        ) {

            return subprefeitura.properties;
        }
    }

    return null;
}

/* ==========================================
   FEATURE DISTRITO
========================================== */

function obterDistritoFeature(
    nomeDistrito
) {

    return distritosGeojson.features.find(
        distrito =>
            distrito.properties
                .nm_distrito_municipal ===
            nomeDistrito
    );
}

/* ==========================================
   FEATURE SUBPREFEITURA
========================================== */

function obterSubprefeituraFeature(
    nomeSubprefeitura
) {

    return subprefeiturasGeojson.features.find(
        subprefeitura =>
            subprefeitura.properties
                .nm_subprefeitura ===
            nomeSubprefeitura
    );
}

/* ==========================================
   DISTRITOS VIZINHOS
========================================== */

function obterDistritosVizinhos(
    nomeDistrito
) {

    const distritoAtual =
        obterDistritoFeature(
            nomeDistrito
        );

    if (!distritoAtual)
        return [];

    const vizinhos = [];

    for (
        const distrito of
        distritosGeojson.features
    ) {

        if (
            distrito.properties
                .nm_distrito_municipal ===
            nomeDistrito
        ) {
            continue;
        }

        const intersecta =
            turf.booleanIntersects(
                distritoAtual,
                distrito
            );

        if (intersecta) {

            vizinhos.push(
                distrito
            );
        }
    }

    return vizinhos;
}

/* ==========================================
   DEBUG
========================================== */

function listarDistritos() {

    return distritosGeojson.features.map(
        distrito =>
            distrito.properties
                .nm_distrito_municipal
    );
}

function listarSubprefeituras() {

    return subprefeiturasGeojson.features.map(
        subprefeitura =>
            subprefeitura.properties
                .nm_subprefeitura
    );
}

function obterRegioesLimitrofes(
    regiao
) {

    const regioes = {

        "Centro": [
            "Norte",
            "Sul",
            "Leste",
            "Oeste"
        ],

        "Norte": [
            "Centro",
            "Oeste",
            "Leste"
        ],

        "Sul": [
            "Centro",
            "Oeste",
            "Leste"
        ],

        "Leste": [
            "Centro",
            "Norte",
            "Sul"
        ],

        "Oeste": [
            "Centro",
            "Norte",
            "Sul"
        ]

    };

    return regioes[regiao] || [];
}