// Recursos compartilhados pelos formulários de RDE:
// pré-visualização das fotos e assinatura do técnico TEAM.

// Mostra uma miniatura logo abaixo de cada input de foto ao selecionar o arquivo
export function initPreviewFotos(ids) {
    ids.forEach(id => {
        const input = document.getElementById(id);
        if (!input) return;

        const preview = document.createElement("div");
        preview.className = "preview-foto d-none";
        preview.innerHTML = `
            <img alt="Pré-visualização">
            <button type="button" class="btn btn-sm btn-outline-danger">Remover foto</button>
        `;
        input.insertAdjacentElement("afterend", preview);

        const img = preview.querySelector("img");
        let urlAtual = null;

        function limpar() {
            if (urlAtual) URL.revokeObjectURL(urlAtual);
            urlAtual = null;
            img.removeAttribute("src");
            preview.classList.add("d-none");
        }

        input.addEventListener("change", () => {
            const file = input.files[0];
            if (!file) return limpar();

            if (urlAtual) URL.revokeObjectURL(urlAtual);
            urlAtual = URL.createObjectURL(file);
            img.src = urlAtual;
            preview.classList.remove("d-none");
        });

        preview.querySelector("button").addEventListener("click", () => {
            input.value = "";
            limpar();
        });
    });
}

// Campo de assinatura desenhada com o dedo / mouse, ou importada de uma imagem
export function initAssinatura(canvasId, btnLimparId, inputImportarId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    let desenhando = false;
    let vazia = true;
    let larguraCss = 0;
    let alturaCss = 0;

    // Ajusta a resolução interna ao tamanho exibido (nítido em celular)
    function ajustarTamanho() {
        const ratio = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // No celular o "resize" dispara ao rolar a página (barra de endereço);
        // só refaz o canvas se o tamanho mudou de verdade, senão a assinatura borra
        if (larguraCss && Math.round(rect.width * ratio) === canvas.width &&
            Math.round(rect.height * ratio) === canvas.height) return;

        const anterior = vazia ? null : copiarCanvas();
        const [larguraAnterior, alturaAnterior] = [larguraCss, alturaCss];

        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        larguraCss = rect.width;
        alturaCss = rect.height;
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0b2a6b";

        // Redesenha no tamanho original (sem esticar ao girar o celular)
        if (anterior) ctx.drawImage(anterior, 0, 0, larguraAnterior, alturaAnterior);
    }

    function copiarCanvas() {
        const copia = document.createElement("canvas");
        copia.width = canvas.width;
        copia.height = canvas.height;
        copia.getContext("2d").drawImage(canvas, 0, 0);
        return copia;
    }

    // Importa uma foto/imagem da assinatura: o fundo claro vira transparente
    // e a assinatura é centralizada no quadro
    function importar(file) {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const escala = Math.min(1, 1200 / Math.max(img.width, img.height));
            const tmp = document.createElement("canvas");
            tmp.width = Math.round(img.width * escala);
            tmp.height = Math.round(img.height * escala);
            const tctx = tmp.getContext("2d");
            tctx.drawImage(img, 0, 0, tmp.width, tmp.height);

            const dados = tctx.getImageData(0, 0, tmp.width, tmp.height);
            const p = dados.data;
            for (let i = 0; i < p.length; i += 4) {
                const brilho = (p[i] + p[i + 1] + p[i + 2]) / 3;
                if (brilho > 190) p[i + 3] = 0;
            }
            tctx.putImageData(dados, 0, 0);

            const ajuste = Math.min(larguraCss / tmp.width, alturaCss / tmp.height) * 0.9;
            const w = tmp.width * ajuste;
            const h = tmp.height * ajuste;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tmp, (larguraCss - w) / 2, (alturaCss - h) / 2, w, h);
            URL.revokeObjectURL(url);

            vazia = false;
            canvas.classList.remove("assinatura-erro");
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            alert("Não foi possível abrir essa imagem. Tente uma foto em JPG ou PNG.");
        };
        img.src = url;
    }

    function posicao(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    canvas.addEventListener("pointerdown", e => {
        desenhando = true;
        canvas.setPointerCapture(e.pointerId);
        const { x, y } = posicao(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 0.1, y + 0.1); // permite marcar um ponto
        ctx.stroke();
        vazia = false;
        canvas.classList.remove("assinatura-erro");
    });

    canvas.addEventListener("pointermove", e => {
        if (!desenhando) return;
        const { x, y } = posicao(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(evt =>
        canvas.addEventListener(evt, () => { desenhando = false; })
    );

    document.getElementById(btnLimparId).addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        vazia = true;
    });

    const inputImportar = document.getElementById(inputImportarId);
    inputImportar.addEventListener("change", () => {
        if (inputImportar.files[0]) importar(inputImportar.files[0]);
        inputImportar.value = ""; // permite escolher a mesma imagem de novo
    });

    window.addEventListener("resize", ajustarTamanho);
    ajustarTamanho();

    // Recorta só a área desenhada, para a assinatura ocupar bem o espaço no relatório
    function recortar() {
        const { width, height } = canvas;
        const pixels = ctx.getImageData(0, 0, width, height).data;
        let minX = width, minY = height, maxX = -1, maxY = -1;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pixels[(y * width + x) * 4 + 3] > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return null;

        const margem = 6;
        minX = Math.max(0, minX - margem);
        minY = Math.max(0, minY - margem);
        maxX = Math.min(width - 1, maxX + margem);
        maxY = Math.min(height - 1, maxY + margem);

        const recorte = document.createElement("canvas");
        recorte.width = maxX - minX + 1;
        recorte.height = maxY - minY + 1;
        recorte.getContext("2d").drawImage(canvas, minX, minY, recorte.width, recorte.height,
            0, 0, recorte.width, recorte.height);
        return recorte.toDataURL("image/png");
    }

    return {
        estaVazia: () => vazia,
        marcarErro: () => canvas.classList.add("assinatura-erro"),
        paraBase64: () => (vazia ? null : recortar())
    };
}
