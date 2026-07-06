let mapa;
let marcadorAtual = null;
let camadaMunicipios = null;
let camadaBairros = null;
let camadaRaio = null;

const CORES = {
    origem: "#EF4444",
    municipio: "#3B82F6",
    bairro: "#A855F7",
    raio: "#10B981"
};


   //inicialização
document.addEventListener("DOMContentLoaded", async () => {

    inicializarMapa();

    try {
        await carregarGeoSampa();
    } catch (e) {
        console.error(e);
    }

});

   //mapa
function inicializarMapa() {

    mapa = L.map("mapa").setView([-23.55052, -46.633308], 10);

    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(mapa);

}


   //loading
function mostrarLoading(status) {

    const loading = document.getElementById("loading");

    if (!loading) return;

    loading.classList.toggle("d-none", !status);

}


   //limpar mapa
function limparMapa() {

    if (marcadorAtual) {
        mapa.removeLayer(marcadorAtual);
        marcadorAtual = null;
    }

    if (camadaMunicipios) {
        mapa.removeLayer(camadaMunicipios);
        camadaMunicipios = null;
    }

    if (camadaBairros) {
        mapa.removeLayer(camadaBairros);
        camadaBairros = null;
    }

    if (camadaRaio) {
        mapa.removeLayer(camadaRaio);
        camadaRaio = null;
    }

}


   //origem
function marcarOrigem(lat, lon) {

    marcadorAtual = L.circleMarker([lat, lon], {

        radius: 8,
        color: "#FFFFFF",
        weight: 2,

        fillColor: CORES.origem,
        fillOpacity: 1

    })

    .bindPopup("<b>Origem da Pesquisa</b>")

    .addTo(mapa);

}


   //raio
function desenharRaio(lat, lon, raioKm) {

    if (camadaRaio) {

        mapa.removeLayer(camadaRaio);

    }

    camadaRaio = L.circle([lat, lon], {

        radius: raioKm * 1000,

        color: CORES.raio,

        weight: 2,

        fillColor: CORES.raio,

        fillOpacity: 0.10

    }).addTo(mapa);

}

   //municipios
function desenharMunicipios(lista) {

    if (!lista?.length) return;

    if (camadaMunicipios) {

        mapa.removeLayer(camadaMunicipios);

    }

    camadaMunicipios = L.layerGroup();

    lista.forEach(item => {

        const marker = L.circleMarker(

            [item.lat, item.lon],

            {

                radius: 6,

                color: CORES.municipio,

                fillColor: CORES.municipio,

                fillOpacity: 0.85

            }

        )

        .bindPopup(`
            <strong>${item.nome}</strong><br>
            Distância: ${item.distancia} km
        `);

        camadaMunicipios.addLayer(marker);

    });

    camadaMunicipios.addTo(mapa);

}

   //bairros
function desenharBairros(lista) {

    if (!lista?.length) return;

    if (camadaBairros) {

        mapa.removeLayer(camadaBairros);

    }

    camadaBairros = L.layerGroup();

    lista.forEach(item => {

        const marker = L.circleMarker(

            [item.lat, item.lon],

            {

                radius: 5,

                color: CORES.bairro,

                fillColor: CORES.bairro,

                fillOpacity: 0.8

            }

        )

        .bindPopup(`
            <strong>${item.nome}</strong><br>
            Distância: ${item.distancia} km
        `);

        camadaBairros.addLayer(marker);

    });

    camadaBairros.addTo(mapa);

}


   //resumo
function atualizarResumo(origem, raio, municipios, bairros) {

    const resultado = document.getElementById("resultado");

    if (!resultado) return;

    resultado.innerHTML = `

        <h5>Resultado</h5>

        <div class="mb-2">

            <strong>Origem</strong><br>

            ${origem}

        </div>

        <div class="mb-2">

            <strong>Raio</strong><br>

            ${raio} km

        </div>

        <div class="mb-2">

            <strong>Municípios</strong><br>

            ${municipios.length}

        </div>

        <div>

            <strong>Bairros</strong><br>

            ${bairros.length}

        </div>

    `;

}


   //execução principal
async function executarAnalise(lat, lon, origem = "Local pesquisado") {

    try {

        mostrarLoading(true);

        limparMapa();

        const raio =
            Number(document.getElementById("raioPesquisa").value) || 20;

        marcarOrigem(lat, lon);

        desenharRaio(lat, lon, raio);

        mapa.fitBounds(camadaRaio.getBounds());

        const municipios =
            await obterMunicipiosPorRaio(lat, lon, raio);

        desenharMunicipios(municipios);

        montarMunicipiosUI(municipios);

        const bairros =
            await obterBairrosPorRaio(lat, lon, raio);

        desenharBairros(bairros);

        montarBairrosUI(bairros);

        atualizarResumo(

            origem,

            raio,

            municipios,

            bairros

        );

    }

    catch (erro) {

        console.error(erro);

        alert("Erro durante a análise territorial.");

    }

    finally {

        mostrarLoading(false);

    }

}


   //UI municipio
function montarMunicipiosUI(municipios) {

    const container = document.getElementById("municipiosContainer");
    const lista = document.getElementById("listaMunicipios");

    if (!container || !lista) return;

    if (!municipios || municipios.length === 0) {

        lista.innerHTML = `
            <div class="alert alert-warning mb-0">
                Nenhum município encontrado.
            </div>
        `;

        container.classList.remove("d-none");
        return;
    }

    lista.innerHTML = municipios.map((m, index) => {

        const bairros = m.bairros || [];

        return `

        <div class="card shadow-sm mb-3 municipio-card">

            <div
                class="card-header d-flex justify-content-between align-items-center municipio-header"
                data-bs-toggle="collapse"
                data-bs-target="#municipio${index}"
                style="cursor:pointer;">

                <div>

                    <div class="fw-bold text-primary">

                        <i class="bi bi-geo-alt-fill"></i>

                        ${m.nome}

                    </div>

                    <small class="text-muted">

                        Distância:
                        ${m.distancia.toFixed(1)} km

                    </small>

                    <br>

                    <small class="text-secondary">

                        ${bairros.length} bairros encontrados

                    </small>

                </div>

                <i class="bi bi-chevron-down fs-5"></i>

            </div>

            <div
                id="municipio${index}"
                class="collapse">

                <div class="card-body">

                    ${
                        bairros.length
                        ?

                        bairros.map(b => `

                            <div class="d-flex justify-content-between border-bottom py-2">

                                <div>

                                    <i class="bi bi-pin-map-fill text-danger"></i>

                                    ${b.nome}

                                </div>

                                <small class="text-muted">

                                    ${b.distancia.toFixed(1)} km

                                </small>

                            </div>

                        `).join("")

                        :

                        `
                        <div class="text-muted">

                            Nenhum bairro localizado.

                        </div>
                        `
                    }

                </div>

            </div>

        </div>

        `;

    }).join("");

    container.classList.remove("d-none");

}


   //UI bairros
function montarBairrosUI(bairros) {

    const container = document.getElementById("bairrosContainer");
    const lista = document.getElementById("listaBairros");

    if (!container || !lista) return;

    lista.innerHTML = `

        <div class="text-center">

            <h4 class="mb-1">${bairros.length}</h4>

            <small class="text-muted">
                bairros encontrados no raio pesquisado
            </small>

        </div>

    `;

    container.classList.remove("d-none");

}
