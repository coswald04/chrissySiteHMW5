try {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        document.documentElement.dataset.theme = savedTheme;
    }
} catch (error) {
    console.warn("Theme preference could not be loaded.", error);
}