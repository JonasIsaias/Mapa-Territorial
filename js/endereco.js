async function buscarEndereco() {

    const endereco =
        document
            .getElementById(
                "enderecoInput"
            )
            .value
            .trim();

    if (!endereco) {

        alert(
            "Digite um endereço."
        );

        return;
    }

    mostrarLoading(true);

    try {

        /* ==========================
           NOMINATIM
        ========================== */

        const url =
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(endereco)}`;

        const resposta =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        const dados =
            await resposta.json();

        if (
            !dados.length
        ) {

            throw new Error(
                "Endereço não encontrado."
            );
        }

        const local =
            dados[0];

        const latitude =
            parseFloat(
                local.lat
            );

        const longitude =
            parseFloat(
                local.lon
            );

        /* ==========================
           DADOS DE EXIBIÇÃO
        ========================== */

        const dadosResultado = {

            endereco:
                local.display_name,

            latitude:
                latitude,

            longitude:
                longitude

        };

        /* ==========================
           PROCESSAR
        ========================== */

        processarLocalizacao(
            latitude,
            longitude,
            dadosResultado
        );

    } catch (erro) {

        console.error(
            erro
        );

        document.getElementById(
            "resultado"
        ).innerHTML = `

        <div class="alert alert-danger">

            <strong>Erro:</strong>
            ${erro.message}

        </div>

        `;

        document
            .getElementById(
                "vizinhosContainer"
            )
            .classList.add(
                "d-none"
            );

    } finally {

        mostrarLoading(false);

    }
}

/* ==========================================
   ENTER NO CAMPO
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const campoEndereco =
            document.getElementById(
                "enderecoInput"
            );

        if (
            campoEndereco
        ) {

            campoEndereco
                .addEventListener(
                    "keypress",
                    function (e) {

                        if (
                            e.key ===
                            "Enter"
                        ) {

                            buscarEndereco();

                        }

                    }
                );

        }

    }
);