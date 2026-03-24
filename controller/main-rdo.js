document.addEventListener("DOMContentLoaded", () => {
    /* ===============================
       PWA - Botão fixo + Toast lembrete
       =============================== */

    let deferredPrompt = null;
    let waitingInstallFromToast = false;

    const ONE_DAY = 1000 * 60 * 60 * 24;

    // Detecta se o app já está instalado
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true;
    }

    // Regra: mostrar toast no máximo 1x por dia
    function shouldShowInstallToast() {
        if (isAppInstalled()) return false;

        const lastShow = localStorage.getItem("install_toast_last_show");
        if (!lastShow) return true;

        return (Date.now() - Number(lastShow)) > ONE_DAY;
    }

    // Mostra o toast (só lembrete visual)
    function showInstallToast() {
        const toastEl = document.getElementById("installToast");
        if (!toastEl) return;

        localStorage.setItem("install_toast_last_show", Date.now());

        const toast = new bootstrap.Toast(toastEl, {
            autohide: false
        });
        toast.show();
    }

    // Captura o evento do navegador (quando existir)
    window.addEventListener("beforeinstallprompt", async (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Se o usuário clicou no toast antes do prompt existir
        if (waitingInstallFromToast) {
            deferredPrompt.prompt();
            waitingInstallFromToast = false;
        }

        if (shouldShowInstallToast()) {
            setTimeout(showInstallToast, 4000);
        }

        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
            localStorage.setItem("pwa_installed", "true");
        }

        deferredPrompt = null;
    });

    // BOTÃO FIXO "INSTALAR APP"
    const installBtn = document.getElementById("installBtn");

    installBtn?.addEventListener("click", async () => {
        if (!deferredPrompt) {
            alert("Instalação indisponível no momento.");
            return;
        }

        deferredPrompt.prompt();
    });

    // BOTÃO DO TOAST
    const toastInstallBtn = document.getElementById("toastInstallBtn");

    toastInstallBtn?.addEventListener("click", (e) => {
        e.preventDefault();

        // Prompt ainda não existe → espera
        if (!deferredPrompt) {
            waitingInstallFromToast = true;
            toastInstallBtn.innerText = "Preparando instalação...";
            return;
        }

        deferredPrompt.prompt();
    });

    // Fechar toast corretamente
    document.getElementById("closeInstallToast")?.addEventListener("click", () => {
        const toastEl = document.getElementById("installToast");
        const toast = bootstrap.Toast.getInstance(toastEl);
        toast?.hide();
    });






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



    // Mostrar próximo grupo do escopo do trabalho
    for (let i = 1; i <= 5; i++) {
        const tag = document.getElementById(`tag0${i}`);
        const diam = document.getElementById(`diam0${i}`);
        const nextGrupo = document.getElementById(`grupo-escopo0${i + 1}`);

        function mostrarProximo() {
            if (tag.value.trim() !== "" || diam.value.trim() !== "") {
                nextGrupo.classList.remove("d-none");
            }
        }
        tag.addEventListener("input", mostrarProximo);
        diam.addEventListener("input", mostrarProximo);
    }



    // Mostrar próximo grupo de horas trabalhadas
    for (let i = 1; i <= 5; i++) {
        const tec = document.getElementById(`tec0${i}`);
        const entra = document.getElementById(`entra0${i}`);
        const nextGrupo = document.getElementById(`grupo-horas0${i + 1}`);
        function mostrarProximo() {
            if (tec.value.trim() !== "" || entra.value.trim() !== "") {
                nextGrupo.classList.remove("d-none");
            }  
        }
        tec.addEventListener("input", mostrarProximo);
        entra.addEventListener("input", mostrarProximo);
    }   


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



        // 3. Validação de stometria
        const setorSelecionado = document.querySelectorAll('input[name="tipoSetor"]:checked');
        const todosSetor = document.querySelectorAll('input[name="tipoSetor"]');

        if (setorSelecionado.length < 1 || setorSelecionado.length > 2) {
            alert("Selecione exatamente uma stometria de reparo.");
            todosSetor.forEach(cb => cb.parentElement.style.border = "2px solid red");
            setorSelecionado.forEach(cb => cb.parentElement.style.border = "none");
            return;
        } else {
            todosSetor.forEach(cb => cb.parentElement.style.border = "none");
        }



        // Captura dos dados ///////////////////////////////////////////////////


        const emissor = document.getElementById("emitido").value;
        const revisor = document.getElementById("revisado").value;

        const nrde = document.getElementById("nrde").value;
        const cliente = document.getElementById("cliente").value;
        const local = document.getElementById("local").value;
        const data = document.getElementById("data").value;
        const osTeam = document.getElementById("osTeam").value;

        const stometriaReparo = Array.from({ length: 9 }, (_, i) => {
            const cb = document.getElementById(`sto${i + 1}`);
            return cb && cb.checked ? cb.value : null;
        }).filter(Boolean);

        const descricao = document.getElementById("descricao").value;

        const anotacao = document.getElementById("anotacao").value;

        // ESCOPO DO TRABALHO
        const EscopoDoTrabalho = [];
        for (let i = 1; i <= 6; i++) {
            const tag = document.getElementById(`tag0${i}`);
            const diam = document.getElementById(`diam0${i}`);
            const tipo = document.getElementById(`tipo0${i}`);
            const descRep0 = document.getElementById(`descRep0${i}`);
            const ss = document.getElementById(`ss0${i}`);
            const fisc = document.getElementById(`fisc0${i}`);

            if (tag && diam && (tag.value.trim() !== "" || diam.value.trim() !== "")) {
                EscopoDoTrabalho.push([`0${i}`, tag.value.trim(), diam.value.trim(), tipo.value.trim(), descRep0.value.trim(), ss.value.trim(), fisc.value.trim()]);
            }
        }


        // HORAS TRABALHADAS
        const horasTrabalhadas = [];
        for (let i = 1; i <= 6; i++) {
            const tec = document.getElementById(`tec0${i}`);
            const entra = document.getElementById(`entra0${i}`);
            const lebPt = document.getElementById(`pt0${i}`);
            const almoEntra = document.getElementById(`almoEntra0${i}`);
            const almoSaida = document.getElementById(`almoSai0${i}`);
            const saida = document.getElementById(`saida0${i}`);
            const extraEntra = document.getElementById(`extraEntra0${i}`);
            const extraSai = document.getElementById(`extraSai0${i}`);


            if (tec && entra && (tec.value.trim() !== "" || entra.value.trim() !== "")) {
                horasTrabalhadas.push([`0${i}`, tec.value.trim(), entra.value.trim(), lebPt.value.trim(), almoEntra.value.trim(), almoSaida.value.trim(), saida.value.trim(), extraEntra.value.trim(), extraSai.value.trim()]);
            }
        }

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
            stometriaReparo,
            descricao,
            anotacao,
            EscopoDoTrabalho,
            materiais,
            horasTrabalhadas
        };

        console.log(dados);
        

        // Salva e redireciona
        localStorage.setItem("dadosRelatorio", JSON.stringify(dados));
        //window.open("../view/modelo/rde-modelo.html", "_blank");
    });
});
