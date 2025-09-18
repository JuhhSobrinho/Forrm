const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const toggleLink = document.getElementById("toggleTheme");

    function toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains("dark-mode");

        body.classList.toggle("dark-mode");
        body.classList.toggle("light-mode");

        // Atualiza o texto do link
        toggleLink.textContent = isDark ? "Modo Claro" : "Modo Escuro";
    }

    toggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        toggleTheme();
    });

    // Tema padrão ao carregar
    window.onload = () => {
        document.body.classList.add("light-mode");
        toggleLink.textContent = "Modo Escuro";
    };


    

    // Tema padrão
    window.onload = () => {
        document.body.classList.add("light-mode");
    };

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
  // Salva os dados no localStorage
  localStorage.setItem("dadosRelatorio", JSON.stringify(dados));

  // Abre a página de modelo em nova aba
  window.open("/Forrm/view/Modelo/rdeModelo.html", "_blank");
}
