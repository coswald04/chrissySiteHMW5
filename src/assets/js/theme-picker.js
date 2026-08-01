const root = document.documentElement;
const picker = document.querySelector("#theme-picker");
const select = document.querySelector("#theme");

const validThemes = ["system", "light", "dark"];

function getSavedTheme() {
    try {
        const savedTheme = localStorage.getItem("theme");

        if (validThemes.includes(savedTheme)) {
            return savedTheme;
        }
    } catch (error) {
        console.warn("Could not read the saved theme.", error);
    }

    return "system";
}

function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
        root.setAttribute("data-theme", theme);
    } else {
        root.removeAttribute("data-theme");
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch (error) {
        console.warn("Could not save the selected theme.", error);
    }
}

if (picker && select) {
    const savedTheme = getSavedTheme();

    applyTheme(savedTheme);
    select.value = savedTheme;
    picker.hidden = false;

    select.addEventListener("change", () => {
        const selectedTheme = select.value;

        if (!validThemes.includes(selectedTheme)) {
            return;
        }

        applyTheme(selectedTheme);
        saveTheme(selectedTheme);
    });
}