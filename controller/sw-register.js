// Registra o service worker e mantém o app sempre na versão mais nova

if ("serviceWorker" in navigator) {
    const swUrl = new URL("../sw.js", import.meta.url);
    const jaTinhaVersao = !!navigator.serviceWorker.controller;
    let formMexido = false;
    let recarregando = false;

    // Se o usuário já começou a preencher, não recarrega sem avisar
    document.addEventListener("input", () => { formMexido = true; });

    navigator.serviceWorker.register(swUrl, { updateViaCache: "none" })
        .then(reg => {
            // Confere se há versão nova sempre que o app volta para a tela
            document.addEventListener("visibilitychange", () => {
                // Sem internet a checagem falha; tudo bem, tenta de novo na próxima vez
                if (document.visibilityState === "visible") reg.update().catch(() => {});
            });
        })
        .catch(err => console.error("Erro ao registrar SW:", err));

    // Uma versão nova assumiu o controle → recarrega para usar os arquivos novos
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!jaTinhaVersao || recarregando) return;

        if (!formMexido) {
            recarregando = true;
            window.location.reload();
        } else {
            mostrarAvisoAtualizacao();
        }
    });
}

function mostrarAvisoAtualizacao() {
    if (document.getElementById("avisoAtualizacao")) return;

    const aviso = document.createElement("div");
    aviso.id = "avisoAtualizacao";
    aviso.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);" +
        "background:rgb(0,94,170);color:#fff;padding:10px 16px;border-radius:10px;" +
        "box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:2000;font-size:14px;";
    aviso.innerHTML = 'Nova versão disponível. Termine o formulário e ' +
        '<a href="#" style="color:#00ffcc;font-weight:600">toque aqui para atualizar</a>.';
    aviso.querySelector("a").addEventListener("click", e => {
        e.preventDefault();
        window.location.reload();
    });
    document.body.appendChild(aviso);
}
