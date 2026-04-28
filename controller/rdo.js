document.addEventListener("DOMContentLoaded", () => {

    const dados = JSON.parse(localStorage.getItem("dadosRelatorio"));
    if (!dados) {
        alert("Dados não encontrados. Preencha o formulário primeiro.");
        return;
    }

    // ── Cabeçalho ──────────────────────────────────────────────────────────
    document.getElementById("tituloRdo").textContent = "Nº " + (dados.nrdo || "");

    // ── Informações básicas ─────────────────────────────────────────────────
    document.getElementById("cliente").textContent = dados.cliente || "";
    document.getElementById("local").textContent = dados.local || "";
    document.getElementById("unidade").textContent = dados.unidade || "";
    document.getElementById("data").textContent = dados.data || "";
    document.getElementById("ssCliente").textContent = dados.osTeam || "";

    // ── Setor checkboxes ────────────────────────────────────────────────────
    const setores = Array.isArray(dados.stometriaReparo) ? dados.stometriaReparo : [];
    document.querySelectorAll(".setor-bloco input[type='checkbox']").forEach(cb => {
        cb.checked = setores.includes(cb.value);
    });

    // ── Escopo do Trabalho ──────────────────────────────────────────────────
    // Cada item: [index, tag, diam, tipo, desc, ss, fisc]
    const MIN_ROWS = 5;
    const tbodyEscopo = document.getElementById("tbodyEscopo");
    const escopoData = Array.isArray(dados.EscopoDoTrabalho) ? dados.EscopoDoTrabalho : [];

    escopoData.forEach(r => {
        tbodyEscopo.appendChild(criarLinhaEscopo(r[1], r[2], r[3], r[4], r[5], r[6]));
    });
    for (let i = escopoData.length; i < MIN_ROWS; i++) {
        tbodyEscopo.appendChild(criarLinhaEscopo());
    }

    // ── Horas Homem ─────────────────────────────────────────────────────────
    // Cada item: [index, tec, entra, pt, almoEntra, almoSai, saida, extraEntra, extraSai]
    const tbodyHoras = document.getElementById("tbodyHoras");
    const horasData = Array.isArray(dados.horasTrabalhadas) ? dados.horasTrabalhadas : [];

    horasData.forEach((r, idx) => {
        tbodyHoras.appendChild(criarLinhaHoras(idx + 1, r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]));
    });
    for (let i = horasData.length; i < MIN_ROWS; i++) {
        tbodyHoras.appendChild(criarLinhaHoras(i + 1));
    }

    // ── Materiais e Equipamentos ────────────────────────────────────────────
    // Cada item: [index, qtd, desc]  →  exibe: item | desc | qtd
    const tbodyMat = document.getElementById("tbodyMat");
    const matData = Array.isArray(dados.materiais) ? dados.materiais : [];

    matData.forEach((r, idx) => {
        tbodyMat.appendChild(criarLinhaMaterial(idx + 1, r[2], r[1]));
    });
    for (let i = matData.length; i < MIN_ROWS; i++) {
        tbodyMat.appendChild(criarLinhaMaterial(i + 1));
    }

    // ── Comentários Adicionais ──────────────────────────────────────────────
    const linhasDivs = document.querySelectorAll("#comentarios .comentarios-linha");
    const linhasTexto = (dados.descricao || "").split("\n").filter(l => l.trim() !== "");
    linhasTexto.forEach((texto, i) => {
        if (linhasDivs[i]) linhasDivs[i].textContent = texto;
    });

    // ── Footer ──────────────────────────────────────────────────────────────

    // ── Impressão ───────────────────────────────────────────────────────────
    document.title = `RDO-${dados.nrdo || "01"}_${dados.local || ""}`;

    // ── Helpers ─────────────────────────────────────────────────────────────
    function td(text, cls) {
        const el = document.createElement("td");
        if (cls) el.className = cls;
        el.textContent = text || "";
        return el;
    }

    function criarLinhaEscopo(tag, diam, tipo, desc, ss, fisc) {
        const tr = document.createElement("tr");
        tr.appendChild(td(tag, "c-tag"));
        tr.appendChild(td(diam, "c-diam"));
        tr.appendChild(td(tipo, "c-tipo"));
        tr.appendChild(td(desc, "c-desc-esc"));
        tr.appendChild(td(ss, "c-ss"));
        tr.appendChild(td(fisc, "c-fisc"));
        return tr;
    }

    function criarLinhaHoras(item, tec, entra, pt, almoEntra, almoSai, saida, extraEntra, extraSai) {
        const tr = document.createElement("tr");
        tr.appendChild(td(item, "c-item"));
        tr.appendChild(td(tec, "c-tec"));
        tr.appendChild(td(entra, "c-tempo"));
        tr.appendChild(td(pt, "c-tempo"));
        tr.appendChild(td(almoEntra, "c-tempo"));
        tr.appendChild(td(almoSai, "c-tempo"));
        tr.appendChild(td(saida, "c-tempo"));
        tr.appendChild(td(extraEntra, "c-tempo extras"));
        tr.appendChild(td(extraSai, "c-tempo extras"));
        return tr;
    }

    function criarLinhaMaterial(item, desc, qtd) {
        const tr = document.createElement("tr");
        tr.appendChild(td(item, "c-item"));
        tr.appendChild(td(desc, "c-mat-desc"));
        tr.appendChild(td(qtd, "c-mat-qtd"));
        return tr;
    }

    // ── Dispara impressão após renderização completa ─────────────────────────
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
        document.body.classList.add("pdf-export", "pdf-mobile");
        html2pdf()
            .set({
                margin: [0, 0, 0, 0],
                filename: `RDO-${dados.nrdo || "01"}.pdf`,
                jsPDF: { unit: "pt", format: [650, 950], orientation: "portrait" },
                html2canvas: { scale: 2 },
                image: { type: "jpeg", quality: 0.98 }
            })
            .from(document.body)
            .save();
    } else {
        console.log("Ola mundinho");
        
        setTimeout(() => window.print(), 300);
    }

});
