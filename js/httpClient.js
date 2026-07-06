const HttpClientGeo = (() => {

    const cache = new Map();
    let lastCall = 0;

    const MIN_INTERVAL = 1100;

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function request(url, options = {}, retries = 4) {

        const cacheKey = url + JSON.stringify(options || {});

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        for (let i = 0; i < retries; i++) {

            const now = Date.now();
            const diff = now - lastCall;

            if (diff < MIN_INTERVAL) {
                await sleep(MIN_INTERVAL - diff);
            }

            try {

                const res = await fetch(url, options);
                lastCall = Date.now();

                   //tratamento de erros http
                if (res.status === 429) {
                    await sleep((i + 1) * 1200);
                    continue;
                }

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                   //Parse seguro (json OU text)

                const text = await res.text();

                let data;

                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.warn("Resposta não JSON recebida:", text);

                    throw new Error("Resposta inválida da API externa");
                }

                cache.set(cacheKey, data);

                return data;

            } catch (err) {

                console.warn("Tentativa falhou:", err.message);

                if (i === retries - 1) {
                    return null; // evita quebrar toda a aplicação
                }

                await sleep(Math.pow(2, i) * 1000);
            }
        }

        return null;
    }

    return { request };

})();
