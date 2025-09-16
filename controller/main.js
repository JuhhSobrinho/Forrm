const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRelatorio");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Captura dos dados do formulário (igual antes)
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
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        // Converter as imagens
        const fotoAntesBase64 = await fileToBase64(fotoAntesFile);
        const fotoDepoisBase64 = await fileToBase64(fotoDepoisFile);
        const fotoAntesPfpBase64 = await fileToBase64(fotoAntesPfpFile);


        // Monta objeto dados
        const dados = {
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
            fotoAntesPfpBase64
        };

        gerarPDF(dados);
    });
});

function gerarPDF(dados) {
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
