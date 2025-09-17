const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    for (let i = 1; i <= 5; i++) {
        const qtd = document.getElementById(`qtd0${i}`);
        const desc = document.getElementById(`desc0${i}`);
        const nextGrupo = document.getElementById(`grupo0${i + 1}`);

        function mostrarProximo() {
            if (qtd.value.trim() !== "" || desc.value.trim() !== "") {
                nextGrupo.classList.remove("d-none");
            }
        }

        qtd.addEventListener("input", mostrarProximo);
        desc.addEventListener("input", mostrarProximo);
    }

    const form = document.getElementById("formRelatorio");





    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const materiais = [];

        for (let i = 1; i <= 6; i++) {
            const qtd = document.getElementById(`qtd0${i}`);
            const desc = document.getElementById(`desc0${i}`);

            if (qtd && desc && (qtd.value.trim() !== "" || desc.value.trim() !== "")) {
                materiais.push([
                    `0${i}`, // ID do item
                    qtd.value.trim(),
                    desc.value.trim()
                ]);
            }
        }

        // Captura dos dados do formulário (igual antes)
        const nrde = document.getElementById("nrde").value;

        const cliente = document.getElementById("cliente").value;
        const local = document.getElementById("local").value;
        const data = document.getElementById("data").value;
        const osTeam = document.getElementById("osTeam").value;

        const tiposReparo = [];
        document.querySelectorAll('input[name="tipoReparo"]:checked').forEach(cb => {
            tiposReparo.push(cb.value);
        });

        const geometriaReparo = [];
        for (let i = 1; i <= 9; i++) {
            const cb = document.getElementById(`geo${i}`);
            if (cb && cb.checked) geometriaReparo.push(cb.value);
        }

        const diametro = document.getElementById("diametro").value;
        const tag = document.getElementById("tag").value;
        const material = document.getElementById("material").value;
        const fluido = document.getElementById("fluido").value;
        const comprimento = document.getElementById("comprimento").value;

        const pressaoProjeto = document.getElementById("pressaoProjeto").value;
        const temperaturaProjeto = document.getElementById("temperaturaProjeto").value;
        const pressaoOperacao = document.getElementById("pressaoOperacao").value;
        const temperaturaOperacao = document.getElementById("temperaturaOperacao").value;
        const camadas = document.getElementById("camadas").value;

        const temperaturaAmbiente = document.getElementById("temperaturaAmbiente").value;
        const temperaturaSuperficie = document.getElementById("temperaturaSuperficie").value;
        const rugosidadeSuperficie = document.getElementById("rugosidadeSuperficie").value;

        const temperaturaOrvalho = document.getElementById("temperaturaOrvalho").value;
        const umidadeRelativa = document.getElementById("umidadeRelativa").value;
        const espessuraReparo = document.getElementById("espessuraReparo").value;

        const descricao = document.getElementById("descricao").value;

        // Arquivos de imagem
        const fotoAntesFile = document.getElementById("AntesExeServico").files[0];
        const fotoDepoisFile = document.getElementById("AposExeServico").files[0];
        const fotoAntesPfpFile = document.getElementById("AposExePfp").files[0];

        // Função para converter arquivo em base64
        function reduzirImagem(file, maxWidth = 600, maxHeight = 400) {
            return new Promise((resolve, reject) => {
                if (!file) return resolve(null);

                const img = new Image();
                const reader = new FileReader();

                reader.onload = () => {
                    img.src = reader.result;
                };

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    let width = img.width;
                    let height = img.height;

                    // Redimensiona proporcionalmente
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL("image/jpeg", 0.6); // qualidade reduzida
                    resolve(base64);
                };

                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }


        // Converter as imagens
        const fotoAntesBase64 = await reduzirImagem(fotoAntesFile);
        const fotoDepoisBase64 = await reduzirImagem(fotoDepoisFile);
        const fotoAntesPfpBase64 = await reduzirImagem(fotoAntesPfpFile);



        // Monta objeto dados
        const dados = {
            nrde,
            cliente,
            local,
            data,
            osTeam,
            tiposReparo,
            geometriaReparo,
            diametro,
            tag,
            material,
            fluido,
            comprimento,
            pressaoProjeto,
            temperaturaProjeto,
            pressaoOperacao,
            temperaturaOperacao,
            camadas,
            temperaturaAmbiente,
            temperaturaSuperficie,
            rugosidadeSuperficie,
            temperaturaOrvalho,
            umidadeRelativa,
            espessuraReparo,
            descricao,
            fotoAntesBase64,
            fotoDepoisBase64,
            fotoAntesPfpBase64,
            materiais // ← aqui!
        }; // abre o modelo em nova aba
        gerarPDF(dados);
    });
});

function gerarPDF(dados) {
    localStorage.setItem("dadosRelatorio", JSON.stringify(dados));
    window.open("/view/Modelo/rdeModelo.html", "_blank");
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(14);
    doc.text("TISI do Brasil - Serviços Industriais Ltda.", 10, 10);
    doc.setFontSize(10);
    doc.text("Rua Doutor Luiz Itálico Bocco, 224 - Pindamonhangaba/SP", 10, 15);
    doc.setFontSize(16);
    doc.text(`Relatório de Execução de Serviço Nº ${dados.numero || ""}`, 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.text("Reparo por Compósito", 105, 32, { align: "center" });

    let y = 40;

    // Dados iniciais
    doc.autoTable({
        startY: y,
        head: [['Campo', 'Valor']],
        body: [
            ['Cliente', dados.cliente],
            ['Data', dados.data],
            ['Local', dados.local],
            ['OS Team', dados.osTeam]
        ],
        theme: 'grid',
        styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 5;


    // Tipo do Reparo
    doc.setFontSize(12);
    doc.text("Tipo do Reparo:", 10, y);
    y += 5;
    dados.tiposReparo.forEach(tipo => {
        doc.text(`☑ ${tipo}`, 15, y);
        y += 5;
    });

    // Geometria do Reparo
    y += 5;
    doc.text("Geometria do Reparo:", 10, y);
    y += 5;
    dados.geometriaReparo.forEach(geo => {
        doc.text(`☑ ${geo}`, 15, y);
        y += 5;
    });

    // Dados de Projeto
    y += 5;
    doc.autoTable({
        startY: y,
        head: [['Dados de Projeto', 'Valor']],
        body: [
            ['Diâmetro Equipamento', dados.diametro],
            ['TAG Equipamento', dados.tag],
            ['Material Equipamento', dados.material],
            ['Fluído Operação', dados.fluido],
            ['Comprimento Reparo', dados.comprimento]
        ],
        theme: 'grid',
        styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 5;

    // Resumo das Atividades
    doc.setFontSize(12);
    doc.text("Resumo das Atividades:", 10, y);
    y += 5;
    const linhasResumo = doc.splitTextToSize(dados.descricao || "Sem descrição", 180);
    doc.text(linhasResumo, 10, y);
    y += linhasResumo.length * 5;

    // Fotos
    if (dados.fotoAntesBase64) {
        doc.text("Antes da Execução do Serviço:", 10, y);
        y += 5;
        doc.addImage(dados.fotoAntesBase64, "JPEG", 10, y, 60, 45);
        y += 50;
    }
    if (dados.fotoDepoisBase64) {
        doc.text("Após Execução do Serviço:", 10, y);
        y += 5;
        doc.addImage(dados.fotoDepoisBase64, "JPEG", 10, y, 60, 45);
        y += 50;
    }
    if (dados.fotoAntesPfpBase64) {
        doc.text("Após Execução do PFP:", 10, y);
        y += 5;
        doc.addImage(dados.fotoAntesPfpBase64, "JPEG", 10, y, 60, 45);
        y += 50;
    }

    // Materiais Utilizados
    doc.autoTable({
        startY: y,
        head: [['Item', 'Qtd.', 'Descrição']],
        body: dados.materiais || [],
        theme: 'grid',
        styles: { fontSize: 10 }
    });

    // Rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: "center" });
    }

    doc.save(`relatorio_${dados.cliente || "sem_cliente"}.pdf`);
}
