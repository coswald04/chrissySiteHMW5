class DogOfTheDay extends HTMLElement {
    static observedAttributes = ["breed", "count"];

    #controller = null;
    #timeoutId = null;
    #retryButton = null;
    #statusText = null;
    #results = null;
    #heading = null;
    #dogList = null;
    #initialized = false;

    connectedCallback() {
        this.#initialize();
        this.#showIdle();
        this.#loadDogs();
    }

    disconnectedCallback() {
        this.#cancelRequest();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (
            oldValue !== newValue &&
            this.isConnected &&
            this.#initialized
        ) {
            this.#loadDogs();
        }
    }

    get breed() {
        const value = this.getAttribute("breed")
            ?.trim()
            .toLowerCase();

        return value || "random";
    }

    get count() {
        const requestedCount = Number.parseInt(
            this.getAttribute("count"),
            10
        );

        if (!Number.isInteger(requestedCount)) {
            return 1;
        }

        return Math.min(Math.max(requestedCount, 1), 6);
    }

    get endpoint() {
        if (this.breed === "random") {
            return `https://dog.ceo/api/breeds/image/random/${this.count}`;
        }

        const safeBreed = encodeURIComponent(this.breed);

        return `https://dog.ceo/api/breed/${safeBreed}/images/random/${this.count}`;
    }

    get cacheKey() {
        return `dog-of-the-day:${this.breed}:${this.count}`;
    }

    #initialize() {
        if (this.#initialized) {
            return;
        }

        const template = document.querySelector("#dog-template");

        if (!(template instanceof HTMLTemplateElement)) {
            console.error("The dog template could not be found.");
            return;
        }

        this.replaceChildren(template.content.cloneNode(true));

        this.#statusText = this.querySelector("[data-status]");
        this.#results = this.querySelector("[data-results]");
        this.#heading = this.querySelector("[data-heading]");
        this.#dogList = this.querySelector("[data-dog-list]");
        this.#retryButton = this.querySelector("[data-retry]");

        this.#retryButton?.addEventListener("click", () => {
            this.#loadDogs({ ignoreCache: true });
        });

        this.#initialized = true;
    }

    #cancelRequest() {
        if (this.#controller) {
            this.#controller.abort();
            this.#controller = null;
        }

        if (this.#timeoutId !== null) {
            clearTimeout(this.#timeoutId);
            this.#timeoutId = null;
        }
    }

    #showIdle(message = "No dog pictures have been loaded yet.") {
        this.dataset.state = "idle";

        this.#statusText.textContent = message;
        this.#statusText.hidden = false;
        this.#results.hidden = true;
        this.#retryButton.hidden = true;
    }

    #showLoading() {
        this.dataset.state = "loading";

        this.#statusText.textContent =
            "Loading today's dog pictures…";

        this.#statusText.hidden = false;
        this.#results.hidden = true;
        this.#retryButton.hidden = true;
    }

    #showEmpty() {
        this.dataset.state = "idle";

        this.#statusText.textContent =
            "No dog pictures were returned.";

        this.#statusText.hidden = false;
        this.#results.hidden = true;
        this.#retryButton.hidden = false;
    }

    #showError(message) {
        this.dataset.state = "error";

        this.#statusText.textContent = message;
        this.#statusText.hidden = false;
        this.#results.hidden = true;
        this.#retryButton.hidden = false;
    }

    #showSuccess(imageUrls) {
        this.dataset.state = "ready";

        this.#statusText.hidden = true;
        this.#results.hidden = false;
        this.#retryButton.hidden = true;

        this.#dogList.replaceChildren();

        const displayedBreed =
            this.breed === "random"
                ? "Random Dogs"
                : this.#formatBreed(this.breed);

        this.#heading.textContent = displayedBreed;

        for (const imageUrl of imageUrls) {
            const listItem = document.createElement("li");
            const figure = document.createElement("figure");
            const image = document.createElement("img");
            const caption = document.createElement("figcaption");

            const detectedBreed =
                this.#getBreedFromImageUrl(imageUrl);

            image.setAttribute("src", imageUrl);
            image.setAttribute(
                "alt",
                `A ${detectedBreed} from the Dog CEO API`
            );
            image.setAttribute("loading", "lazy");

            caption.textContent = detectedBreed;

            figure.append(image, caption);
            listItem.append(figure);
            this.#dogList.append(listItem);
        }
    }

    #formatBreed(breed) {
        return breed
            .split(/[-_]/)
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
    }

    #getBreedFromImageUrl(imageUrl) {
        try {
            const url = new URL(imageUrl);
            const breedFolder = url.pathname.split("/")[2];

            return this.#formatBreed(
                breedFolder || this.breed
            );
        } catch {
            return this.#formatBreed(this.breed);
        }
    }

    #getCachedDogs() {
        try {
            const storedValue =
                sessionStorage.getItem(this.cacheKey);

            if (!storedValue) {
                return null;
            }

            const cachedEntry = JSON.parse(storedValue);
            const thirtyMinutes = 30 * 60 * 1000;
            const cacheAge =
                Date.now() - cachedEntry.savedAt;

            if (cacheAge > thirtyMinutes) {
                sessionStorage.removeItem(this.cacheKey);
                return null;
            }

            return cachedEntry.imageUrls;
        } catch (error) {
            console.warn("Dog cache could not be read.", error);
            return null;
        }
    }

    #cacheDogs(imageUrls) {
        try {
            const cachedEntry = {
                savedAt: Date.now(),
                imageUrls
            };

            sessionStorage.setItem(
                this.cacheKey,
                JSON.stringify(cachedEntry)
            );
        } catch (error) {
            console.warn("Dog pictures could not be cached.", error);
        }
    }

    async #loadDogs({ ignoreCache = false } = {}) {
        if (!this.#initialized) {
            return;
        }

        this.#cancelRequest();

        if (!ignoreCache) {
            const cachedDogs = this.#getCachedDogs();

            if (Array.isArray(cachedDogs) && cachedDogs.length > 0) {
                this.#showSuccess(cachedDogs);
                return;
            }
        }

        this.#showLoading();

        this.#controller = new AbortController();

        let timedOut = false;

        this.#timeoutId = setTimeout(() => {
            timedOut = true;
            this.#controller?.abort();
        }, 8000);

        try {
            const response = await fetch(this.endpoint, {
                signal: this.#controller.signal,
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(
                    `The API returned status ${response.status}.`
                );
            }

            const data = await response.json();

            const imageUrls = Array.isArray(data.message)
                ? data.message
                : data.message
                    ? [data.message]
                    : [];

            if (
                data.status !== "success" ||
                imageUrls.length === 0
            ) {
                this.#showEmpty();
                return;
            }

            this.#cacheDogs(imageUrls);
            this.#showSuccess(imageUrls);
        } catch (error) {
            if (error.name === "AbortError") {
                if (timedOut) {
                    this.#showError(
                        "The request took too long. Please try again."
                    );
                }

                return;
            }

            console.error(error);

            this.#showError(
                "The dog pictures could not be loaded. Check the breed or try again."
            );
        } finally {
            if (this.#timeoutId !== null) {
                clearTimeout(this.#timeoutId);
                this.#timeoutId = null;
            }

            this.#controller = null;
        }
    }
}

customElements.define("dog-of-the-day", DogOfTheDay);