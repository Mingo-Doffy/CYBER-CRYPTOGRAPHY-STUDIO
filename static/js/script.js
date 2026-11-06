/**
 * Murciélago Studio - Moteur de cryptographie & Ergonomie
 * Mode Chiffrement / Déchiffrement avec support des accents & actions rapides
 */

document.addEventListener("DOMContentLoaded", () => {
    // Éléments du DOM
    const inputText = document.getElementById("inputText");
    const outputText = document.getElementById("outputText");
    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");

    const inputCharCount = document.getElementById("inputCharCount");
    const inputWordCount = document.getElementById("inputWordCount");
    const outputCharCount = document.getElementById("outputCharCount");
    const transformedCount = document.getElementById("transformedCount");

    const clearBtn = document.getElementById("clearBtn");
    const copyBtn = document.getElementById("copyBtn");
    const copyIcon = document.getElementById("copyIcon");
    const copyBtnText = document.getElementById("copyBtnText");
    const pasteBtn = document.getElementById("pasteBtn");
    const swapBtn = document.getElementById("swapBtn");

    const statusText = document.getElementById("statusText");
    const statusDot = document.getElementById("statusDot");
    const handleAccentsCheck = document.getElementById("handleAccents");
    const toastContainer = document.getElementById("toastContainer");

    const btnCrypt = document.getElementById("btnCrypt");
    const btnDecrypt = document.getElementById("btnDecrypt");
    const modeButtons = [btnCrypt, btnDecrypt];

    let currentMode = "crypter"; // "crypter" ou "decrypter"

    // Table de correspondance Murciélago
    const murcielago = {
        M: "0",
        U: "1",
        R: "2",
        C: "3",
        I: "4",
        E: "5",
        L: "6",
        A: "7",
        G: "8",
        O: "9"
    };

    // Table inverse (0-9 -> M-O)
    const inverse = Object.fromEntries(
        Object.entries(murcielago).map(([letter, digit]) => [digit, letter])
    );

    // Normalisation des accents français/espagnols
    function normalizeAccents(str) {
        return str
            .replace(/[éèêë]/gi, "e")
            .replace(/[àâäá]/gi, "a")
            .replace(/[îïí]/gi, "i")
            .replace(/[ôöó]/gi, "o")
            .replace(/[ùûüú]/gi, "u")
            .replace(/[ç]/gi, "c");
    }

    // Algorithme de conversion
    function convertText(text) {
        let result = "";
        let substitutions = 0;
        const useAccents = handleAccentsCheck ? handleAccentsCheck.checked : true;

        if (currentMode === "crypter") {
            const processedText = useAccents ? normalizeAccents(text) : text;

            for (let i = 0; i < processedText.length; i++) {
                const char = processedText[i];
                const upper = char.toUpperCase();

                if (murcielago[upper] !== undefined) {
                    result += murcielago[upper];
                    substitutions++;
                } else {
                    result += char;
                }
            }
        } else {
            // Mode Déchiffrer
            for (let i = 0; i < text.length; i++) {
                const char = text[i];

                if (inverse[char] !== undefined) {
                    result += inverse[char];
                    substitutions++;
                } else {
                    result += char;
                }
            }
        }

        return { result, substitutions };
    }

    // Calcul du nombre de mots
    function countWords(str) {
        const trimmed = str.trim();
        if (!trimmed) return 0;
        return trimmed.split(/\s+/).length;
    }

    // Notification Toast Bootstrap / Flottante
    function showToast(message, iconClass = "bi-info-circle") {
        if (!toastContainer) return;

        const toast = document.createElement("div");
        toast.className = "toast align-items-center text-bg-dark border-cyber show mb-2 shadow-lg";
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", "assertive");
        toast.setAttribute("aria-atomic", "true");
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center gap-2 text-white">
                    <i class="bi ${iconClass} text-neon-matrix"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fermer"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Actualisation temps réel de l'interface
    function updateResult() {
        const text = inputText.value;
        const { result, substitutions } = convertText(text);

        outputText.value = result;

        // Métriques d'entrée
        const charLen = text.length;
        inputCharCount.textContent = `${charLen} caractère${charLen > 1 ? "s" : ""}`;
        const words = countWords(text);
        inputWordCount.textContent = `${words} mot${words > 1 ? "s" : ""}`;

        // Métriques de sortie
        const outLen = result.length;
        outputCharCount.textContent = `${outLen} caractère${outLen > 1 ? "s" : ""}`;
        transformedCount.textContent = `${substitutions} substitution${substitutions > 1 ? "s" : ""}`;

        // Statut global
        if (text.length > 0) {
            statusDot.classList.add("active");
            statusText.textContent = `Conversion instantanée active (${substitutions} caractère${substitutions > 1 ? "s" : ""} modifié${substitutions > 1 ? "s" : ""})`;
        } else {
            statusDot.classList.remove("active");
            statusText.textContent = "En attente de saisie...";
        }
    }

    // Basculement de mode (Chiffrer / Déchiffrer)
    function setMode(mode) {
        currentMode = mode;

        modeButtons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        if (mode === "crypter") {
            inputLabel.innerHTML = '<i class="bi bi-pencil-square me-1"></i>Texte Original';
            outputLabel.innerHTML = '<i class="bi bi-shield-check me-1"></i>Résultat Chiffré';
            inputText.placeholder = "Écrivez ou collez votre message en clair...";
            outputText.placeholder = "Le résultat chiffré s'affichera ici...";
        } else {
            inputLabel.innerHTML = '<i class="bi bi-lock me-1"></i>Code à Déchiffrer';
            outputLabel.innerHTML = '<i class="bi bi-unlock me-1"></i>Texte Déchiffré';
            inputText.placeholder = "Collez le message chiffré (avec des chiffres de 0 à 9)...";
            outputText.placeholder = "Le texte en clair s'affichera ici...";
        }

        updateResult();
    }

    // Inversion Swap (Résultat -> Entrée & Mode Inverse)
    function handleSwap() {
        const currentOutput = outputText.value;
        const newMode = currentMode === "crypter" ? "decrypter" : "crypter";

        // Permuter le contenu
        inputText.value = currentOutput;

        // Animer l'icône swap
        const icon = swapBtn.querySelector(".swap-icon");
        if (icon) {
            icon.style.transform = "rotate(360deg)";
            setTimeout(() => { icon.style.transform = ""; }, 300);
        }

        // Basculer de mode et recalculer
        setMode(newMode);
        inputText.focus();

        showToast(`Champs inversés — Mode ${newMode === "crypter" ? "Chiffrement" : "Déchiffrement"} actif`, "bi-arrow-left-right");
    }

    // Écouteurs d'événements
    inputText.addEventListener("input", updateResult);

    if (handleAccentsCheck) {
        handleAccentsCheck.addEventListener("change", updateResult);
    }

    modeButtons.forEach(button => {
        button.addEventListener("click", () => {
            setMode(button.dataset.mode);
        });
    });

    // Bouton Effacer
    clearBtn.addEventListener("click", () => {
        inputText.value = "";
        updateResult();
        inputText.focus();
        showToast("Texte effacé", "bi-trash3");
    });

    // Bouton Swap
    swapBtn.addEventListener("click", handleSwap);

    // Bouton Coller
    pasteBtn.addEventListener("click", async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText) {
                inputText.value = clipboardText;
                updateResult();
                showToast("Texte collé depuis le presse-papier", "bi-clipboard-check");
            }
        } catch (err) {
            showToast("Accès au presse-papier refusé. Utilisez Ctrl+V", "bi-exclamation-triangle");
            inputText.focus();
        }
    });

    // Bouton Copier
    copyBtn.addEventListener("click", async () => {
        const textToCopy = outputText.value;
        if (!textToCopy) {
            showToast("Aucun résultat à copier", "bi-exclamation-circle");
            return;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);

            copyBtn.classList.add("copied");
            copyIcon.className = "bi bi-check2 me-1";
            copyBtnText.textContent = "Copié !";

            showToast("Résultat copié dans le presse-papier !", "bi-check2-circle");

            setTimeout(() => {
                copyBtn.classList.remove("copied");
                copyIcon.className = "bi bi-clipboard me-1";
                copyBtnText.textContent = "Copier";
            }, 2000);
        } catch (err) {
            showToast("Impossible de copier automatiquement", "bi-x-circle");
        }
    });

    // Raccourcis clavier ergonomiques
    document.addEventListener("keydown", (e) => {
        // Alt + S : Swap
        if (e.altKey && (e.key === "s" || e.key === "S")) {
            e.preventDefault();
            handleSwap();
        }

        // Ctrl + Entrée / Cmd + Entrée : Copier
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            copyBtn.click();
        }

        // Échap : Effacer si on est dans la zone de texte
        if (e.key === "Escape" && document.activeElement === inputText) {
            e.preventDefault();
            clearBtn.click();
        }
    });

    // Initialisation
    updateResult();
});
