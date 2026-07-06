async function buscarCEP() {

    const campoCep = document.getElementById("cepInput");

    if (!campoCep) return;

    const cep = campoCep.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        alert("Informe um CEP válido.");
        return;
    }

    mostrarLoading(true);

    try {
           //via cep
        const dadosCep = await HttpClientGeo.request(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        if (!dadosCep || dadosCep.erro) {
            throw new Error("CEP não encontrado.");
        }

           //endereço completo
        const enderecoCompleto = [

            dadosCep.logradouro,
            dadosCep.bairro,
            dadosCep.localidade,
            dadosCep.uf,
            "Brasil"

        ].filter(Boolean).join(", ");

           //nominatim
        const resultadoGeo = await HttpClientGeo.request(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(enderecoCompleto)}`
        );

        if (!resultadoGeo || !resultadoGeo.length) {
            throw new Error("Não foi possível localizar o endereço.");
        }

        const latitude = Number(resultadoGeo[0].lat);
        const longitude = Number(resultadoGeo[0].lon);


           //executa a análise
        await executarAnalise(

            latitude,
            longitude,
            enderecoCompleto

        );

    }

    catch (erro) {

        console.error(erro);

        const resultado =
            document.getElementById("resultado");

        if (resultado) {

            resultado.innerHTML = `
                <div class="alert alert-danger">

                    <strong>Erro</strong>

                    <br>

                    ${erro.message}

                </div>
            `;

        }

    }

    finally {

        mostrarLoading(false);

    }

}

   //enter
document.addEventListener("DOMContentLoaded", () => {

    const campo = document.getElementById("cepInput");

    if (!campo) return;

    campo.addEventListener("keydown", e => {

        if (e.key === "Enter") {

            buscarCEP();

        }

    });

});

   //mascara de cep
document.addEventListener("DOMContentLoaded", () => {

    const campo = document.getElementById("cepInput");

    if (!campo) return;

    campo.addEventListener("input", e => {

        let valor = e.target.value.replace(/\D/g, "");

        if (valor.length > 8)
            valor = valor.substring(0, 8);

        if (valor.length > 5) {

            valor =
                valor.substring(0, 5) +
                "-" +
                valor.substring(5);

        }

        e.target.value = valor;

    });

});
