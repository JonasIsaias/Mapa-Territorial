let mapa;

let marcadorAtual = null;

let camadaDistrito = null;
let camadaSubprefeitura = null;
let camadaVizinhos = null;

/* ==========================================
   PALETA DE CORES
========================================== */

const CORES = {

    local: "#EF4444",

    distrito: "#3B82F6",

    vizinho: "#F59E0B",

    subprefeitura: "#374151"

};

/* ==========================================
   INICIALIZAÇÃO
========================================== */

window.onload = async () => {

    mostrarLoading(true);

    inicializarMapa();

    await carregarGeoSampa();

    mostrarLoading(false);

};

/* ==========================================
   MAPA
========================================== */

function inicializarMapa() {

    mapa = L.map("mapa").setView(
        [-23.55052, -46.633308],
        11
    );

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            attribution:
                "&copy; OpenStreetMap Contributors"
        }
    ).addTo(mapa);
}

/* ==========================================
   LOADING
========================================== */

function mostrarLoading(exibir) {

    const loading =
        document.getElementById(
            "loading"
        );

    if (exibir) {

        loading.classList.remove(
            "d-none"
        );

    } else {

        loading.classList.add(
            "d-none"
        );
    }
}

/* ==========================================
   LIMPAR CAMADAS
========================================== */

function limparMapa() {

    if (marcadorAtual) {
        mapa.removeLayer(
            marcadorAtual
        );
    }

    if (camadaDistrito) {
        mapa.removeLayer(
            camadaDistrito
        );
    }

    if (camadaSubprefeitura) {
        mapa.removeLayer(
            camadaSubprefeitura
        );
    }

    if (camadaVizinhos) {
        mapa.removeLayer(
            camadaVizinhos
        );
    }
}

/* ==========================================
   ATUALIZAR MAPA
========================================== */

function atualizarMapa(
    latitude,
    longitude
) {

    limparMapa();

    marcadorAtual = L.circleMarker(
        [latitude, longitude],
        {
            radius: 12,

            color: "#FFFFFF",

            weight: 3,

            fillColor: CORES.local,

            fillOpacity: 1
        }
    )
    .addTo(mapa)
    .bindPopup("Local pesquisado");

    mapa.setView(
        [
            latitude,
            longitude
        ],
        15
    );
}

/* ==========================================
   DESENHAR DISTRITO
========================================== */

function desenharDistrito(
    distritoFeature
) {

    if (!distritoFeature)
        return;

    camadaDistrito =
        L.geoJSON(
            distritoFeature,
            {
                style: {
                    color: CORES.distrito,
                    weight: 5,
                    fillColor: CORES.distrito,
                    fillOpacity: 0.55
                }
            }
        ).addTo(mapa);

}

/* ==========================================
   DESENHAR SUBPREFEITURA
========================================== */

function desenharSubprefeitura(
    subprefFeature
) {

    if (!subprefFeature)
        return;

    camadaSubprefeitura =
        L.geoJSON(
            subprefFeature,
            {
                style: {
                    color: CORES.subprefeitura,
                    weight: 3,
                    fillColor: CORES.subprefeitura,
                    fillOpacity: 0.08
                }
            }
        ).addTo(mapa);

}

/* ==========================================
   DESENHAR VIZINHOS
========================================== */

function desenharVizinhos(
    vizinhos
) {

    if (!vizinhos.length)
        return;

    camadaVizinhos =
        L.geoJSON(
            {
                type:
                    "FeatureCollection",

                features:
                    vizinhos
            },
            {
                style: {
                    color: CORES.vizinho,
                    weight: 4,
                    fillColor: CORES.vizinho,
                    fillOpacity: 0.40
                }
            }
        ).addTo(mapa);

}

/* ==========================================
   AJUSTAR ZOOM
========================================== */

function ajustarZoom(
    distritoFeature
) {

    if (!distritoFeature)
        return;

    const camada =
        L.geoJSON(
            distritoFeature
        );

    mapa.fitBounds(
        camada.getBounds()
    );
}

/* ==========================================
   RESULTADO
========================================== */

function mostrarResultado(
    dados
) {

    const resultado =
        document.getElementById(
            "resultado"
        );

    resultado.innerHTML = `

    <div class="card shadow-sm resultado-card">

        <div class="card-body">

            <h4 class="mb-4">
                Resultado da Consulta
            </h4>

            ${
                dados.cep
                ? `
                <div class="resultado-item">
                    <strong>CEP:</strong>
                    ${dados.cep}
                </div>`
                : ''
            }

            ${
                dados.logradouro
                ? `
                <div class="resultado-item">
                    <strong>Logradouro:</strong>
                    ${dados.logradouro}
                </div>`
                : ''
            }

            ${
                dados.bairro
                ? `
                <div class="resultado-item">
                    <strong>Bairro:</strong>
                    ${dados.bairro}
                </div>`
                : ''
            }

            ${
                dados.localidade
                ? `
                <div class="resultado-item">
                    <strong>Cidade:</strong>
                    ${dados.localidade}
                </div>`
                : ''
            }

            ${
                dados.uf
                ? `
                <div class="resultado-item">
                    <strong>Estado:</strong>
                    ${dados.uf}
                </div>`
                : ''
            }

            ${
                dados.endereco
                ? `
                <div class="resultado-item">
                    <strong>Endereço:</strong>
                    ${dados.endereco}
                </div>`
                : ''
            }

            ${
                dados.distrito
                ? `
                <div class="resultado-item">
                    <strong>Distrito:</strong>
                    ${dados.distrito}
                </div>`
                : ''
            }

            ${
                dados.subprefeitura
                ? `
                <div class="resultado-item">
                    <strong>Subprefeitura:</strong>
                    ${dados.subprefeitura}
                </div>`
                : ''
            }

            ${
                dados.regiao
                ? `
                <div class="resultado-item">
                    <strong>Região:</strong>
                    ${dados.regiao}
                </div>`
                : ''
            }

            ${
                dados.regioesLimitrofes
                ?
                `
                <div class="resultado-item">

                    <strong>
                        Regiões Limítrofes:
                    </strong>

                    ${dados.regioesLimitrofes.join(", ")}

                </div>
                `
                : ''
            }

            ${
                dados.latitude
                ? `
                <div class="resultado-item">
                    <strong>Latitude:</strong>
                    ${dados.latitude}
                </div>`
                : ''
            }

            ${
                dados.longitude
                ? `
                <div class="resultado-item">
                    <strong>Longitude:</strong>
                    ${dados.longitude}
                </div>`
                : ''
            }

        </div>

    </div>
    `;
}

/* ==========================================
   EXIBIR VIZINHOS
========================================== */

function mostrarDistritosVizinhos(
    vizinhos
) {

    const container =
        document.getElementById(
            "vizinhosContainer"
        );

    const lista =
        document.getElementById(
            "listaVizinhos"
        );

    lista.innerHTML = "";

    if (
        !vizinhos ||
        !vizinhos.length
    ) {

        container.classList.add(
            "d-none"
        );

        return;
    }

    vizinhos.forEach(
        vizinho => {

            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                vizinho.properties
                .nm_distrito_municipal;

            lista.appendChild(
                item
            );
        }
    );

    container.classList.remove(
        "d-none"
    );
}

/* ==========================================
   PROCESSAR CONSULTA
========================================== */

function processarLocalizacao(
    latitude,
    longitude,
    dadosOriginais
) {

    const distrito =
        localizarDistrito(
            latitude,
            longitude
        );

    const subprefeitura =
        localizarSubprefeitura(
            latitude,
            longitude
        );

    if (!distrito) {

        mostrarResultado({
            ...dadosOriginais,
            latitude,
            longitude
        });

        atualizarMapa(
            latitude,
            longitude
        );

        return;
    }

    const distritoFeature =
        obterDistritoFeature(
            distrito.nm_distrito_municipal
        );

    const subprefFeature =
        obterSubprefeituraFeature(
            subprefeitura.nm_subprefeitura
        );

    const vizinhos =
        obterDistritosVizinhos(
            distrito.nm_distrito_municipal
        );

    const regioesLimitrofes =
        obterRegioesLimitrofes(
            distrito.nm_regiao_05
        );

    mostrarResultado({

        ...dadosOriginais,

        distrito:
            distrito.nm_distrito_municipal,

        subprefeitura:
            subprefeitura
                .nm_subprefeitura,

        regiao:
            distrito.nm_regiao_05,

        regioesLimitrofes:
            regioesLimitrofes,

        latitude,
        longitude

    });

    mostrarDistritosVizinhos(
        vizinhos
    );

    atualizarMapa(
        latitude,
        longitude
    );

    desenharDistrito(
        distritoFeature
    );

    desenharSubprefeitura(
        subprefFeature
    );

    desenharVizinhos(
        vizinhos
    );

    ajustarZoom(
        distritoFeature
    );
}