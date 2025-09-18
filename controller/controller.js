document.addEventListener("DOMContentLoaded", () => {
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

        if (tipoReparoSelecionados.length !== 1) {
            alert("Selecione exatamente um tipo de reparo.");
            todosTipoReparo.forEach(cb => cb.parentElement.style.border = "2px solid red");
            tipoReparoSelecionados.forEach(cb => cb.parentElement.style.border = "none");
            return;
        } else {
            todosTipoReparo.forEach(cb => cb.parentElement.style.border = "none");
        }

        // 3. Validação de geometria
        const geoSelecionados = document.querySelectorAll('input[name="tipoGeo"]:checked');
        const todosGeo = document.querySelectorAll('input[name="tipoGeo"]');

        if (geoSelecionados.length !== 1) {
            alert("Selecione exatamente uma geometria de reparo.");
            todosGeo.forEach(cb => cb.parentElement.style.border = "2px solid red");
            geoSelecionados.forEach(cb => cb.parentElement.style.border = "none");
            return;
        } else {
            todosGeo.forEach(cb => cb.parentElement.style.border = "none");
        }


        // Captura dos dados
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
        const fluido = document.getElementById("fluido").value; //
        const numbInjecao = document.getElementById("numbInjecao").value; //comprimento
        const pressaoProjeto = document.getElementById("pressaoProjeto").value;
        const temperaturaProjeto = document.getElementById("temperaturaProjeto").value;
        const pressaoOperacao = document.getElementById("pressaoOperacao").value;
        const temperaturaOperacao = document.getElementById("temperaturaOperacao").value;
        const pressInjecao = document.getElementById("pressInjecao").value; //camadas
        const descricao = document.getElementById("descricao").value;

        // Imagens
        const fotoAntesFile = document.getElementById("AntesExeServico").files[0];
        const fotoDepoisFile = document.getElementById("AposExeServico").files[0];

        const fotoAntesBase64 = await reduzirImagem(fotoAntesFile);
        const fotoDepoisBase64 = await reduzirImagem(fotoDepoisFile);

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
            numbInjecao,
            pressaoProjeto,
            temperaturaProjeto,
            pressaoOperacao,
            temperaturaOperacao,
            pressInjecao,
            descricao,
            fotoAntesBase64,
            fotoDepoisBase64,
            materiais
        };

        // Salva e redireciona
        localStorage.setItem("dadosRelatorio", JSON.stringify(dados));
        window.open("/view/Modelo/rdeReparo.html", "_blank");
    });
});
