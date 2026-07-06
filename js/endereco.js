async function buscarEndereco() {

    const endereco = document
        .getElementById("enderecoInput")
        .value
        .trim();

    if (!endereco) {
        alert("Digite um endereço.");
        return;
    }

    mostrarLoading(true);

    try {
           //geocodificação
        const dados = await HttpClientGeo.request(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco)}`
        );

        if (!dados || !dados.length) {
            throw new Error("Endereço não encontrado.");
        }

        const local = dados[0];

        const latitude = Number(local.lat);
        const longitude = Number(local.lon);


           //fluxo central novo
        await executarAnalise(latitude, longitude);


        const resultado = document.getElementById("resultado");

        resultado.innerHTML = `

            <div class="sidebar-card">

                <h5 class="mb-3">
                    <i class="bi bi-geo-alt-fill text-success"></i>
                    Local Encontrado
                </h5>

                <div class="mb-2">
                    <strong>Endereço</strong><br>
                    ${local.display_name}
                </div>

                <div class="mb-2">
                    <strong>Latitude</strong><br>
                    ${latitude.toFixed(6)}
                </div>

                <div class="mb-2">
                    <strong>Longitude</strong><br>
                    ${longitude.toFixed(6)}
                </div>

                <div>
                    <strong>Raio</strong><br>
                    ${document.getElementById("raioPesquisa").value} km
                </div>

            </div>

        `;

    } catch (erro) {

        console.error(erro);

        document.getElementById("resultado").innerHTML = `
            <div class="alert alert-danger">
                <strong>Erro:</strong><br>
                ${erro.message}
            </div>
        `;

    } finally {

        mostrarLoading(false);

    }

}

   //enter
document.addEventListener("DOMContentLoaded", () => {

    const campo = document.getElementById("enderecoInput");

    if (!campo) return;

    campo.addEventListener("keypress", e => {

        if (e.key === "Enter") {
            buscarEndereco();
        }

    });

});

   //mantido para compatibilidade
function mostrarMunicipiosLimitrofes(municipios) {

    const container = document.getElementById("vizinhosContainer");
    const lista = document.getElementById("listaVizinhos");

    if (!container || !lista) return;

    lista.innerHTML = "";

    if (!municipios || !municipios.length) {

        container.classList.add("d-none");
        return;

    }

    municipios.forEach(municipio => {

        const li = document.createElement("li");

        li.className = "mb-2";

        li.innerHTML = `
            <strong>${municipio.nome || municipio.properties?.nome}</strong>
            ${municipio.distancia ? `<br><small>${municipio.distancia} km</small>` : ""}
        `;

        lista.appendChild(li);

    });

    container.classList.remove("d-none");

}
