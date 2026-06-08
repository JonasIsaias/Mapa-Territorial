async function buscarCEP() {

    const cep =
        document
            .getElementById(
                "cepInput"
            )
            .value
            .replace(/\D/g, "");

    if (!cep) {

        alert(
            "Informe um CEP."
        );

        return;
    }

    mostrarLoading(true);

    try {

        /* ==========================
           VIA CEP
        ========================== */

        const respostaCep =
            await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

        const dadosCep =
            await respostaCep.json();

        if (
            dadosCep.erro
        ) {

            throw new Error(
                "CEP não encontrado."
            );
        }

        /* ==========================
           ENDEREÇO COMPLETO
        ========================== */

        const enderecoCompleto =
            `
            ${dadosCep.logradouro},
            ${dadosCep.bairro},
            ${dadosCep.localidade},
            ${dadosCep.uf},
            Brasil
            `;

        /* ==========================
           NOMINATIM
        ========================== */

        const url =
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(enderecoCompleto)}`;

        const respostaGeo =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        const geoDados =
            await respostaGeo.json();

        if (
            !geoDados.length
        ) {

            throw new Error(
                "Não foi possível localizar o endereço."
            );
        }

        const latitude =
            parseFloat(
                geoDados[0].lat
            );

        const longitude =
            parseFloat(
                geoDados[0].lon
            );

        /* ==========================
           PROCESSAR
        ========================== */

        processarLocalizacao(
            latitude,
            longitude,
            {
                cep:
                    dadosCep.cep,

                logradouro:
                    dadosCep.logradouro,

                bairro:
                    dadosCep.bairro,

                localidade:
                    dadosCep.localidade,

                uf:
                    dadosCep.uf
            }
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

    } finally {

        mostrarLoading(false);

    }
}