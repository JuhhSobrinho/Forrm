document.addEventListener("DOMContentLoaded", () => {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;

        const btnInstall = document.getElementById("btnInstallPwa");
        if (btnInstall) {
            btnInstall.style.display = "inline-block";
        }
    });

    const btnInstall = document.getElementById("btnInstallPwa");
    if (btnInstall) {
        btnInstall.addEventListener("click", async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log("Resultado da instalação:", outcome);
            deferredPrompt = null;
            btnInstall.style.display = "none";
        });
    }





    const toggleLink = document.getElementById("toggleTheme");
    const form = document.getElementById("formRelatorio");

    // Alternância de tema
    function toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains("dark-mode");

        body.classList.toggle("dark-mode");
        body.classList.toggle("light-mode");

        toggleLink.textContent = isDark ? "Ir para Modo Escuro" : "Ir para Modo Claro";
    }

    toggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        toggleTheme();
    });

    // Tema padrão ao carregar
    document.body.classList.add("light-mode");
    toggleLink.textContent = "Ir para Modo Escuro";

    // Validação visual ao digitar
    const inputs = document.querySelectorAll("#formRelatorio input.campo-obrigatorio, #formRelatorio textarea.campo-obrigatorio");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            input.style.border = "1px solid var(--cor-destaque)";
        });
    });

    // Mostrar próximo grupo de materiais
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

    // Função para reduzir imagem
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

                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL("image/jpeg", 0.6);
                resolve(base64);
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // SUBMIT do formulário
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Validação de campos obrigatórios
        let camposVazios = [];
        inputs.forEach(input => {
            if (input.value.trim() === "") {
                input.style.border = "2px solid red";
                camposVazios.push(input);
            } else {
                input.style.border = "1px solid var(--cor-destaque)";
            }
        });

        if (camposVazios.length > 0) {
            alert("Preencha todos os campos obrigatórios antes de continuar.");
            return;
        }


        // Validação dos campos obrigatórios

        // 2. Validação de tipo de reparo
        const tipoReparoSelecionados = document.querySelectorAll('input[name="tipoReparo"]:checked');
        const todosTipoReparo = document.querySelectorAll('input[name="tipoReparo"]');
        console.log(tipoReparoSelecionados.length);

        if (tipoReparoSelecionados.length < 1 || tipoReparoSelecionados.length > 2) {
            alert("Selecione exatamente um ou dois tipos de reparo.");
            console.log(tipoReparoSelecionados.length);

            todosTipoReparo.forEach(cb => cb.parentElement.style.border = "2px solid red");
            tipoReparoSelecionados.forEach(cb => cb.parentElement.style.border = "none");
            return;
        } else {
            todosTipoReparo.forEach(cb => cb.parentElement.style.border = "none");
        }


        // 3. Validação de geometria
        const geoSelecionados = document.querySelectorAll('input[name="tipoGeo"]:checked');
        const todosGeo = document.querySelectorAll('input[name="tipoGeo"]');

        if (geoSelecionados.length < 1 || geoSelecionados.length > 2) {
            alert("Selecione exatamente uma geometria de reparo.");
            todosGeo.forEach(cb => cb.parentElement.style.border = "2px solid red");
            geoSelecionados.forEach(cb => cb.parentElement.style.border = "none");
            return;
        } else {
            todosGeo.forEach(cb => cb.parentElement.style.border = "none");
        }

        const furoSelecionado = document.querySelector('input[name="furoNaLinha"]:checked');
        const todosFuro = document.querySelectorAll('input[name="furoNaLinha"]');

        if (!furoSelecionado) {
            alert("Selecione uma opção para 'Furo na Linha'.");

            todosFuro.forEach(rb => {
                rb.parentElement.style.border = "2px solid red";
                rb.parentElement.style.borderRadius = "5px"; // opcional, pra ficar bonitinho
                rb.parentElement.style.padding = "5px"; // se quiser dar espaço
            });

            return;
        } else {
            todosFuro.forEach(rb => {
                rb.parentElement.style.border = "none";
            });
        }



        // Captura dos dados ///////////////////////////////////////////////////


        const emissor = document.getElementById("emitido").value;
        const revisor = document.getElementById("revisado").value;

        const nrde = document.getElementById("nrde").value;
        const cliente = document.getElementById("cliente").value;
        const local = document.getElementById("local").value;
        const data = document.getElementById("data").value;
        const osTeam = document.getElementById("osTeam").value;

        const tiposReparo = Array.from(
            document.querySelectorAll('input[name="tipoReparo"]:checked')
        ).map(cb => cb.value);

        const geometriaReparo = Array.from({ length: 9 }, (_, i) => {
            const cb = document.getElementById(`geo${i + 1}`);
            return cb && cb.checked ? cb.value : null;
        }).filter(Boolean);

        const diametro = document.getElementById("diametro").value;
        const tag = document.getElementById("tag").value;
        const material = document.getElementById("material").value;
        const fluido = document.getElementById("fluido").value;
        const comprimento = document.getElementById("comprimento").value;


        const kitResimac101 = document.getElementById("kitResimac101").value;
        const kitResimac114 = document.getElementById("kitResimac114").value;
        const comprimentoPFP = document.getElementById("comprimentoPFP").value;
        const numeroOM = document.getElementById("numeroOM").value;



        const pressaoProjeto = document.getElementById("pressaoProjeto").value;
        const temperaturaProjeto = document.getElementById("temperaturaProjeto").value;
        const pressaoOperacao = document.getElementById("pressaoOperacao").value;
        const temperaturaOperacao = document.getElementById("temperaturaOperacao").value;
        const camadas = document.getElementById("camadas").value;

        const espessuraPFP = document.getElementById("espessuraPFP").value;
        const furoNaLinha = furoSelecionado ? furoSelecionado.value : null;



        const temperaturaAmbiente = document.getElementById("temperaturaAmbiente").value;
        const temperaturaSuperficie = document.getElementById("temperaturaSuperficie").value;
        const rugosidadeSuperficie = document.getElementById("rugosidadeSuperficie").value;
        const temperaturaOrvalho = document.getElementById("temperaturaOrvalho").value;
        const umidadeRelativa = document.getElementById("umidadeRelativa").value;
        const espessuraReparo = document.getElementById("espessuraReparo").value;
        const descricao = document.getElementById("descricao").value;

        // Imagens
        const fotoAntesFile = document.getElementById("AntesExeServico").files[0];
        const fotoDepoisFile = document.getElementById("AposExeServico").files[0];
        const fotoAntesPfpFile = document.getElementById("AposExePfp").files[0];

        const fotoAntesBase64 = await reduzirImagem(fotoAntesFile);
        const fotoDepoisBase64 = await reduzirImagem(fotoDepoisFile);
        const fotoAntesPfpBase64 = await reduzirImagem(fotoAntesPfpFile);

        const anotacao = document.getElementById("anotacao").value;

        // Materiais
        const materiais = [];
        for (let i = 1; i <= 6; i++) {
            const qtd = document.getElementById(`qtd0${i}`);
            const desc = document.getElementById(`desc0${i}`);
            if (qtd && desc && (qtd.value.trim() !== "" || desc.value.trim() !== "")) {
                materiais.push([`0${i}`, qtd.value.trim(), desc.value.trim()]);
            }
        }

        // Monta objeto final
        const dados = {
            emissor,
            revisor,
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
            kitResimac101,
            comprimentoPFP,
            numeroOM,
            pressaoProjeto,
            temperaturaProjeto,
            pressaoOperacao,
            temperaturaOperacao,
            camadas,
            espessuraPFP,
            kitResimac114,
            furoNaLinha,
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
            anotacao,
            materiais
        };

        // Salva e redireciona
        localStorage.setItem("dadosRelatorio", JSON.stringify(dados));
        window.open("../view/modelo/rde-modelo.html", "_blank");
    });
});
